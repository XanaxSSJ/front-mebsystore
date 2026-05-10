import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { patchOrderStatusAdmin } from "@/server/order-service";

export async function PATCH(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAdmin();
    const { orderId } = await ctx.params;
    const body = await req.json();
    const statusStr = body.status != null ? String(body.status).toUpperCase() : null;
    if (!statusStr) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    const order = await patchOrderStatusAdmin(orderId, statusStr);
    return NextResponse.json(order);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Invalid status")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (msg === "ORDER_CONFLICT") {
      return NextResponse.json(
        { error: "La orden cambió mientras se actualizaba. Recarga e intenta de nuevo." },
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
