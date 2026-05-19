import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getProductById, updateProduct } from "@/server/product-service";
import { PUBLIC_GET_CACHE_HEADERS } from "@/lib/http/public-cache";

export async function GET(_req: Request, ctx: { params: Promise<{ productId: string }> }) {
  const { productId } = await ctx.params;
  const p = await getProductById(productId, { activeOnly: true });
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(p, { headers: PUBLIC_GET_CACHE_HEADERS });
}

export async function PUT(req: Request, ctx: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { productId } = await ctx.params;
    const body = await req.json();
    const updated = await updateProduct(productId, {
      name: body.name,
      description: body.description,
      brandId: body.brandId,
      categoryId: body.categoryId,
      basePrice: body.basePrice,
      active: body.active,
      variants: body.variants,
      images: body.images,
    });
    return NextResponse.json(updated);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Product not found")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
