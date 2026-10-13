import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { getSession } from "@/lib/auth/session";
import { setAuthCookie } from "@/lib/auth/cookies";
import { ChangePasswordSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  });

  const newToken = await signToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role,
    mustChangePassword: false,
  });
  await setAuthCookie(newToken);

  return NextResponse.json({
    ok: true,
    redirectTo: updated.role === "admin" ? "/admin/dashboard" : "/",
  });
}