import { createHmac, timingSafeEqual } from "node:crypto";

function hex(bytes: Buffer): string {
  return bytes.toString("hex");
}

export function validateMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null,
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
  if (!secret) return true;
  if (!dataId) return true;
  if (!xSignature || !xRequestId) return false;

  let ts: string | null = null;
  let v1: string | null = null;
  for (const part of xSignature.split(",")) {
    const p = part.trim();
    if (p.startsWith("ts=")) ts = p.slice(3);
    else if (p.startsWith("v1=")) v1 = p.slice(3);
  }
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const h = createHmac("sha256", secret).update(manifest).digest();
  const calculated = hex(h);
  if (calculated.length !== v1.length) return false;
  try {
    return timingSafeEqual(Buffer.from(calculated, "utf8"), Buffer.from(v1, "utf8"));
  } catch {
    return false;
  }
}
