type MpItem = {
  id: string;
  title: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
};

export async function mpCreatePreference(params: {
  items: MpItem[];
  payerEmail: string;
  externalReference: string;
  notificationUrl: string;
  backUrls: { success: string; failure: string; pending: string };
}): Promise<{ initPoint: string; id: string }> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

  const body = {
    items: params.items,
    payer: { email: params.payerEmail },
    external_reference: params.externalReference,
    notification_url: params.notificationUrl,
    back_urls: params.backUrls,
    auto_return: "approved",
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    if (res.status === 403 && t.includes("PA_UNAUTHORIZED_RESULT_FROM_POLICIES")) {
      throw new Error(
        "Mercado Pago bloqueó la preferencia (PA_UNAUTHORIZED_RESULT_FROM_POLICIES). " +
          "Revisa que el Access Token pertenezca a la cuenta correcta y que la cuenta/aplicación esté habilitada para Checkout Pro en este entorno.",
      );
    }
    throw new Error(`Mercado Pago preference error: ${res.status} ${t}`);
  }

  const data = (await res.json()) as { init_point?: string; id?: string };
  if (!data.init_point || !data.id) throw new Error("Invalid Mercado Pago response");
  return { initPoint: data.init_point, id: data.id };
}

/** IDs válidos en GET /v1/payments/{id} son numéricos (no UUID de orden). */
export function isMercadoPagoPaymentId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

export async function mpGetPayment(paymentId: string): Promise<{
  status: string | null;
  external_reference: string | null;
} | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mercado Pago payment error: ${res.status} ${t}`);
  }

  const data = (await res.json()) as { status?: string; external_reference?: string | null };
  return {
    status: data.status ?? null,
    external_reference: data.external_reference ?? null,
  };
}
