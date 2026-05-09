import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createProduct, listProductsPublic } from "@/server/product-service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const attributeValueIds = url.searchParams.getAll("attributeValueIds");
    const inStockOnly = url.searchParams.get("inStockOnly") === "true";
    const data = await listProductsPublic({ attributeValueIds, inStockOnly });
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const created = await createProduct({
      name: body.name,
      description: body.description,
      brandId: body.brandId,
      categoryId: body.categoryId,
      basePrice: body.basePrice,
      variants: body.variants,
      images: body.images,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
