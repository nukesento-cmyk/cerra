import { SignJWT, jwtVerify } from "jose";

export type JwtPayload = {
  sub: string;
  email: string;
  role: "admin" | "buyer";
  mustChangePassword: boolean;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export function signToken(payload: JwtPayload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}