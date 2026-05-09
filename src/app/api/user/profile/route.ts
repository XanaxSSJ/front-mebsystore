import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({
      where: { email: session.email },
      include: { profile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const p = user.profile;
    return NextResponse.json({
      id: p?.id ?? null,
      userId: user.id,
      email: user.email,
      firstName: p?.firstName ?? null,
      lastName: p?.lastName ?? null,
      phone: p?.phone ?? null,
      createdAt: p?.createdAt?.toISOString() ?? null,
      updatedAt: p?.updatedAt?.toISOString() ?? null,
    });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const body = await req.json();
    const firstName = body.firstName != null ? String(body.firstName) : null;
    const lastName = body.lastName != null ? String(body.lastName) : null;
    const phone = body.phone != null ? String(body.phone) : null;

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        id: randomUUID(),
        userId: user.id,
        firstName,
        lastName,
        phone,
      },
      update: { firstName, lastName, phone },
    });

    return NextResponse.json({
      id: profile.id,
      userId: user.id,
      email: user.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
