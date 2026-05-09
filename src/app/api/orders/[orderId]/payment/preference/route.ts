import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createPaymentPreference } from "@/server/order-service";

export async function POST(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await requireSession();
    const { orderId } = await ctx.params;
    const body = await req.json();
    const shippingCost = body.shippingCost != null ? Number(body.shippingCost) : 0;
    const pref = await createPaymentPreference(session.email, orderId, shippingCost);
    return NextResponse.json({ initPoint: pref.initPoint, id: pref.id });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json(null, { status: 403 });
    if (status === 400) return NextResponse.json(null, { status: 400 });
    console.error(e);
    return NextResponse.json(null, { status: 500 });
  }
}
