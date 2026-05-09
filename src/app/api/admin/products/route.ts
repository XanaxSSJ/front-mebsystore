import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listProductsAdmin } from "@/server/product-service";

export async function GET() {
  try {
    await requireAdmin();
    const products = await listProductsAdmin();
    return NextResponse.json(products);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
