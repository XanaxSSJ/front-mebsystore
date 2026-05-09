import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getOrderById } from "@/server/order-service";

export async function GET(_req: Request, ctx: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await requireSession();
    const { orderId } = await ctx.params;
    const order = await getOrderById(session.email, orderId);
    return NextResponse.json(order);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json(null, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Order not found") return NextResponse.json({ error: msg }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
