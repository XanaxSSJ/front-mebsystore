import * as jose from "jose";

export const JWT_COOKIE_NAME = "jwt";

export async function signJwt(email: string, roles: string[]): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  const key = new TextEncoder().encode(secret);
  const ms = Number(process.env.JWT_EXPIRATION_MS ?? 86_400_000);
  return new jose.SignJWT({ roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + Math.floor(ms / 1000))
    .sign(key);
}

export async function verifyJwt(token: string): Promise<{ email: string; roles: string[] }> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  const key = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, key);
  return {
    email: String(payload.sub),
    roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
  };
}
