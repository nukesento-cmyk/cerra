import { cookies } from "next/headers";

export const AUTH_COOKIE = "cerra_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function readAuthCookie() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}