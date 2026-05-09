import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { validateUbigeo } from "@/server/location-service";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const rows = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      rows.map((a) => ({
        id: a.id,
        userId: a.userId,
        street: a.street,
        department: a.department,
        province: a.province,
        district: a.district,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    );
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const body = await req.json();
    const street = String(body.street ?? "").trim();
    const department = String(body.department ?? "").trim();
    const province = String(body.province ?? "").trim();
    const district = String(body.district ?? "").trim();

    await validateUbigeo(department, province, district);

    const a = await prisma.address.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        street,
        department,
        province,
        district,
      },
    });

    return NextResponse.json(
      {
        id: a.id,
        userId: a.userId,
        street: a.street,
        department: a.department,
        province: a.province,
        district: a.district,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Invalid location")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
