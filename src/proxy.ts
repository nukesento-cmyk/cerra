import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const CURRENCY_COOKIE = "cerra_currency";


const AUTH_COOKIE = "cerra_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

type Payload = {
  sub: string;
  role: "admin" | "buyer";
  mustChangePassword: boolean;
};

async function readSession(req: NextRequest): Promise<Payload | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Payload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = await readSession(req);

  // Not logged in, or not an admin → home
  if (!session || session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Admin with mustChangePassword, but not on the first-login page → force it
  const isFirstLogin = pathname.startsWith("/admin/first-login");
  if (session.mustChangePassword && !isFirstLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/first-login";
    return NextResponse.redirect(url);
  }

  // Admin who already changed password, but sitting on first-login → dashboard
  if (!session.mustChangePassword && isFirstLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};