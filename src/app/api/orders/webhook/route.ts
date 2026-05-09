import { NextResponse } from "next/server";
import { validateMercadoPagoSignature } from "@/server/webhook-validation";
import { markOrderPaidIfPending, processPaymentWebhook } from "@/server/order-service";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id");
    const xSig = req.headers.get("x-signature");
    const xRid = req.headers.get("x-request-id");

    if (!validateMercadoPagoSignature(xSig, xRid, dataId)) {
      return NextResponse.json(null, { status: 400 });
    }

    const payload = (await req.json()) as {
      type?: string;
      action?: string;
      data?: { id?: string | number; external_reference?: string };
    };

    const type = payload.type;
    const action = payload.action;

    if (type === "payment" && payload.data?.id != null) {
      await processPaymentWebhook(String(payload.data.id));
    } else if (type === "merchant_order" && action === "merchant_order.updated") {
      const ref = payload.data?.external_reference;
      if (ref) await markOrderPaidIfPending(ref);
    }

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(null, { status: 500 });
  }
}
