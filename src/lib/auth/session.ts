import { cookies } from "next/headers";
import { JWT_COOKIE_NAME, verifyJwt } from "./jwt";

export type Session = { email: string; roles: string[] };

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyJwt(token);
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await requireSession();
  if (!s.roles.includes("ROLE_ADMIN")) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return s;
}
