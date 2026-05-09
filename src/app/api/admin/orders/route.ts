import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listAllOrdersAdmin } from "@/server/order-service";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await listAllOrdersAdmin();
    return NextResponse.json(orders);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
