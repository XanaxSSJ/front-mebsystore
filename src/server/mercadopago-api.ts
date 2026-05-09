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
    throw new Error(`Mercado Pago preference error: ${res.status} ${t}`);
  }

  const data = (await res.json()) as { init_point?: string; id?: string };
  if (!data.init_point || !data.id) throw new Error("Invalid Mercado Pago response");
  return { initPoint: data.init_point, id: data.id };
}

export async function mpGetPayment(paymentId: string): Promise<{
  status: string | null;
  external_reference: string | null;
}> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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
