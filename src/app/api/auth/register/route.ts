import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: `Email already exists: ${email}` }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        password: await hashPassword(password),
        role: "USER",
        active: true,
      },
    });

    return NextResponse.json({ userId: user.id, email: user.email }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
