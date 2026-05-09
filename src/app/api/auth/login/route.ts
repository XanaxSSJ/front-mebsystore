import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { JWT_COOKIE_NAME, signJwt } from "@/lib/auth/jwt";
import { jwtCookieBase } from "@/lib/auth/cookie-options";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.active) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const token = await signJwt(user.email, [`ROLE_${user.role}`]);
    const res = NextResponse.json({ token });
    res.cookies.set(JWT_COOKIE_NAME, token, jwtCookieBase());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
