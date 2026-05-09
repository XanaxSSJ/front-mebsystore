import { NextResponse } from "next/server";
import { expirePendingPaymentOrders } from "@/server/order-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const expired = await expirePendingPaymentOrders();
    return NextResponse.json({ ok: true, expired });
  } catch (e) {
    console.error("[cron expire-pending-orders]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
