import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createProduct, listProductsPublic } from "@/server/product-service";
import { PUBLIC_GET_CACHE_HEADERS } from "@/lib/http/public-cache";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const attributeValueIds = url.searchParams.getAll("attributeValueIds");
    const inStockOnly = url.searchParams.get("inStockOnly") === "true";
    const categoryId = url.searchParams.get("categoryId") ?? undefined;
    const excludeProductId = url.searchParams.get("excludeProductId") ?? undefined;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const data = await listProductsPublic({
      attributeValueIds,
      inStockOnly,
      categoryId,
      excludeProductId,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return NextResponse.json(data, { headers: PUBLIC_GET_CACHE_HEADERS });
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
