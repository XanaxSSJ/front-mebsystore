import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { validateUbigeo } from "@/server/location-service";

export async function PUT(req: Request, ctx: { params: Promise<{ addressId: string }> }) {
  try {
    const session = await requireSession();
    const { addressId } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Address not found with id: " + addressId }, { status: 404 });
    }

    const body = await req.json();
    const street = String(body.street ?? "").trim();
    const department = String(body.department ?? "").trim();
    const province = String(body.province ?? "").trim();
    const district = String(body.district ?? "").trim();
    await validateUbigeo(department, province, district);

    const a = await prisma.address.update({
      where: { id: addressId },
      data: { street, department, province, district },
    });

    return NextResponse.json({
      id: a.id,
      userId: a.userId,
      street: a.street,
      department: a.department,
      province: a.province,
      district: a.district,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    });
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

export async function DELETE(_req: Request, ctx: { params: Promise<{ addressId: string }> }) {
  try {
    const session = await requireSession();
    const { addressId } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id: addressId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
