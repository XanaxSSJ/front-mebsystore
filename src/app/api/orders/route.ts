import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createOrder } from "@/server/order-service";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const order = await createOrder(session.email, {
      items: body.items,
      shippingAddressId: body.shippingAddressId,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Insufficient stock")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
