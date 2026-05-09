import { NextResponse } from "next/server";
import { JWT_COOKIE_NAME } from "@/lib/auth/jwt";
import { jwtCookieBase } from "@/lib/auth/cookie-options";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(JWT_COOKIE_NAME, "", { ...jwtCookieBase(), maxAge: 0 });
  return res;
}
