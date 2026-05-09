import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { patchVariantStock } from "@/server/product-service";

export async function PATCH(req: Request, ctx: { params: Promise<{ productId: string; variantId: string }> }) {
  try {
    await requireAdmin();
    const { productId, variantId } = await ctx.params;
    const body = await req.json();
    if (body.stock == null) return NextResponse.json(null, { status: 400 });
    const stock = Number(body.stock);
    const product = await patchVariantStock(productId, variantId, stock);
    return NextResponse.json(product);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
