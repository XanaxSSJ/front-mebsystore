import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getProductAttributes, replaceProductAttributes } from "@/server/product-service";

export async function GET(_req: Request, ctx: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await ctx.params;
    const data = await getProductAttributes(productId);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Product not found")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { productId } = await ctx.params;
    const body = await req.json();
    const attrs = Array.isArray(body.attributes) ? body.attributes : [];
    const data = await replaceProductAttributes(
      productId,
      attrs.map((a: { name?: string; displayName?: string; values?: string[] }) => ({
        name: String(a.name ?? ""),
        displayName: String(a.displayName ?? ""),
        values: Array.isArray(a.values) ? a.values.map(String) : [],
      })),
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
