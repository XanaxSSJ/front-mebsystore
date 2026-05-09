import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { addProductImage } from "@/server/product-service";
import { uploadImageBuffer } from "@/server/cloudinary";

export async function POST(req: Request, ctx: { params: Promise<{ productId: string; variantId: string }> }) {
  try {
    await requireAdmin();
    const { productId, variantId } = await ctx.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageBuffer(buf);
    const product = await addProductImage(productId, variantId, url);
    return NextResponse.json(product);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error al subir imagen";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
