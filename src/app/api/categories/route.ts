import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/auth/session";
import { PUBLIC_GET_CACHE_HEADERS } from "@/lib/http/public-cache";

export async function GET() {
  const rows = await prisma.category.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      active: true,
      createdAt: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      active: c.active,
      createdAt: c.createdAt.toISOString(),
      productsCount: c._count.products,
    })),
    { headers: PUBLIC_GET_CACHE_HEADERS },
  );
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const slug = generateSlug(name);
    const dup = await prisma.category.findUnique({ where: { slug } });
    if (dup) return NextResponse.json({ error: `Category slug already exists: ${slug}` }, { status: 409 });
    const c = await prisma.category.create({
      data: { id: randomUUID(), name, slug, active: true },
    });
    return NextResponse.json(
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        active: c.active,
        createdAt: c.createdAt.toISOString(),
        productsCount: 0,
      },
      { status: 201 },
    );
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
