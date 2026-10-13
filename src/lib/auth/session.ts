import { readAuthCookie } from "./cookies";
import { verifyToken, type JwtPayload } from "./jwt";
import { prisma } from "@/lib/db";

export async function getSession(): Promise<JwtPayload | null> {
  const token = await readAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, mustChangePassword: true },
  });
  if (!user) return null;

  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}