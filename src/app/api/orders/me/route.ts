import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listMyOrders } from "@/server/order-service";

export async function GET() {
  try {
    const session = await requireSession();
    const orders = await listMyOrders(session.email);
    return NextResponse.json(orders);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
