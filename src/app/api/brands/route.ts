import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  const rows = await prisma.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    rows.map((b) => {
      const o: Record<string, unknown> = {
        id: b.id,
        name: b.name,
        active: b.active,
        createdAt: b.createdAt.toISOString(),
      };
      o.slug = b.slug;
      if (b.logoUrl) o.logoUrl = b.logoUrl;
      return o;
    }),
  );
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const logoUrl = body.logoUrl != null ? String(body.logoUrl) : null;
    if (!name) return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    const slug = generateSlug(name);
    const b = await prisma.brand.create({
      data: {
        id: randomUUID(),
        name,
        slug,
        logoUrl,
        active: true,
      },
    });
    const o: Record<string, unknown> = {
      id: b.id,
      name: b.name,
      active: b.active,
      createdAt: b.createdAt.toISOString(),
      slug: b.slug,
    };
    if (b.logoUrl) o.logoUrl = b.logoUrl;
    return NextResponse.json(o, { status: 201 });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
