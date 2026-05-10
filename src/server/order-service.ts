import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { isMercadoPagoPaymentId, mpCreatePreference, mpGetPayment } from "@/server/mercadopago-api";
import { validateUbigeo } from "@/server/location-service";

const ORDER_INCLUDE = { items: true } as const;

export type OrderLoaded = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function dec(d: Prisma.Decimal) {
  return Number(d);
}

export function mapOrderToHttp(o: OrderLoaded) {
  return {
    id: o.id,
    userId: o.userId,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: dec(i.unitPrice),
      subtotal: dec(i.subtotal),
    })),
    total: dec(o.total),
    status: o.status,
    shippingAddress:
      o.shippingStreet && o.shippingDepartment && o.shippingProvince && o.shippingDistrict
        ? {
            street: o.shippingStreet,
            department: o.shippingDepartment,
            province: o.shippingProvince,
            district: o.shippingDistrict,
          }
        : null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    expiresAt: o.expiresAt?.toISOString() ?? null,
  };
}

async function requireUserId(email: string): Promise<string> {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) throw new Error("User not found");
  return u.id;
}

function buildLineKey(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

function aggregateRequestedLines(items: { productId: string; variantId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = buildLineKey(item.productId, item.variantId);
    map.set(key, (map.get(key) ?? 0) + item.quantity);
  }
  return map;
}

function aggregateOrderLines(
  orderItems: { productId: string; variantId: string; quantity: number }[],
) {
  const map = new Map<string, number>();
  for (const item of orderItems) {
    const key = buildLineKey(item.productId, item.variantId);
    map.set(key, (map.get(key) ?? 0) + item.quantity);
  }
  return map;
}

function linesAreEqual(a: Map<string, number>, b: Map<string, number>) {
  if (a.size !== b.size) return false;
  for (const [key, qty] of a.entries()) {
    if ((b.get(key) ?? 0) !== qty) return false;
  }
  return true;
}

export async function createOrder(
  email: string,
  body: { items: { productId: string; variantId: string; quantity: number }[]; shippingAddressId: string },
) {
  await expirePendingPaymentOrders().catch((e) =>
    console.error("[createOrder] expirePendingPaymentOrders", e),
  );
  const userId = await requireUserId(email);
  const items = body.items;
  if (!items?.length) throw new Error("Order must have at least one item");
  if (!body.shippingAddressId) throw new Error("Shipping address is required");

  const address = await prisma.address.findFirst({
    where: { id: body.shippingAddressId, userId },
  });
  if (!address) throw new Error("Address not found with id: " + body.shippingAddressId);
  await validateUbigeo(address.department, address.province, address.district);

  const requestedLines = aggregateRequestedLines(items);
  const pendingOrders = await prisma.order.findMany({
    where: { userId, status: "PENDING_PAYMENT" },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const now = new Date();
  const reusable = pendingOrders.find((order) => {
    if (order.expiresAt && order.expiresAt <= now) return false;
    const sameAddress =
      order.shippingStreet === address.street &&
      order.shippingDepartment === address.department &&
      order.shippingProvince === address.province &&
      order.shippingDistrict === address.district;
    if (!sameAddress) return false;
    const orderLines = aggregateOrderLines(order.items);
    return linesAreEqual(requestedLines, orderLines);
  });
  if (reusable) {
    return mapOrderToHttp(reusable);
  }

  const orderId = randomUUID();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  let total = new Prisma.Decimal(0);
  const lineItems: {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    subtotal: Prisma.Decimal;
  }[] = [];

  const stockUpdates: { variantId: string; newStock: number }[] = [];

  for (const line of items) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      include: { variants: true },
    });
    if (!product) throw new Error("Product not found with id: " + line.productId);
    if (!product.active) throw new Error(`Product ${product.name} is not available for purchase`);

    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) throw new Error("Variant not found in product");
    if (!variant.active) throw new Error(`Variant ${variant.sku} is not available`);
    if (variant.stock < line.quantity) {
      throw new Error(
        `Insufficient stock for variant ${variant.sku}. Available: ${variant.stock}, Requested: ${line.quantity}`,
      );
    }

    const unitPrice =
      variant.price != null
        ? variant.price
        : product.basePrice != null
          ? product.basePrice
          : new Prisma.Decimal(0);
    const subtotal = unitPrice.mul(line.quantity);
    total = total.add(subtotal);

    lineItems.push({
      id: randomUUID(),
      productId: product.id,
      variantId: variant.id,
      productName: `${product.name} - ${variant.sku}`,
      quantity: line.quantity,
      unitPrice,
      subtotal,
    });

    stockUpdates.push({ variantId: variant.id, newStock: variant.stock - line.quantity });
  }

  if (total.lte(0)) throw new Error("Total must be greater than 0");

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        id: orderId,
        userId,
        total,
        status: "PENDING_PAYMENT",
        shippingStreet: address.street,
        shippingDepartment: address.department,
        shippingProvince: address.province,
        shippingDistrict: address.district,
        expiresAt,
        items: {
          create: lineItems.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
    });

    for (const u of stockUpdates) {
      await tx.productVariant.update({
        where: { id: u.variantId },
        data: { stock: u.newStock },
      });
    }
  });

  const saved = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  return mapOrderToHttp(saved);
}

export async function listMyOrders(email: string) {
  await expirePendingPaymentOrders().catch((e) =>
    console.error("[listMyOrders] expirePendingPaymentOrders", e),
  );
  const userId = await requireUserId(email);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrderToHttp);
}

export async function getOrderById(email: string, orderId: string) {
  await expirePendingPaymentOrders().catch((e) =>
    console.error("[getOrderById] expirePendingPaymentOrders", e),
  );
  const userId = await requireUserId(email);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  if (!order) throw new Error("Order not found");
  if (order.userId !== userId) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return mapOrderToHttp(order);
}

export async function createPaymentPreference(email: string, orderId: string, shippingCost: number) {
  const userId = await requireUserId(email);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  if (!order) throw new Error("Order not found");
  if (order.userId !== userId) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  if (order.status !== "PENDING_PAYMENT") {
    const err = new Error("BAD_STATE");
    (err as Error & { status: number }).status = 400;
    throw err;
  }

  const mpItems = order.items.map((i) => ({
    id: i.productId,
    title: i.productName,
    quantity: i.quantity,
    currency_id: "PEN",
    unit_price: dec(i.unitPrice),
  }));

  if (shippingCost > 0) {
    mpItems.push({
      id: "shipping",
      title: "Costo de envío",
      quantity: 1,
      currency_id: "PEN",
      unit_price: shippingCost,
    });
  }

  const successUrl = process.env.MERCADOPAGO_SUCCESS_URL ?? "";
  const failureUrl = process.env.MERCADOPAGO_FAILURE_URL ?? "";
  const pendingUrl = process.env.MERCADOPAGO_PENDING_URL ?? "";
  const webhookUrl = process.env.MERCADOPAGO_WEBHOOK_URL ?? "";

  if (!successUrl || !webhookUrl) {
    throw new Error("Mercado Pago URLs not configured");
  }

  const orderIdParam = `orderId=${order.id}`;
  const q = (u: string) => u + (u.includes("?") ? "&" : "?") + orderIdParam;

  const pref = await mpCreatePreference({
    items: mpItems,
    payerEmail: email,
    externalReference: order.id,
    notificationUrl: webhookUrl,
    backUrls: {
      success: q(successUrl),
      failure: q(failureUrl || successUrl),
      pending: q(pendingUrl || successUrl),
    },
  });

  return { initPoint: pref.initPoint, id: pref.id };
}

function mapPaymentToOrderStatus(paymentStatus: string | null): string {
  if (!paymentStatus) return "PENDING_PAYMENT";
  const s = paymentStatus.toLowerCase();
  if (s === "approved") return "PAID";
  if (s === "pending" || s === "in_process" || s === "in_mediation") return "PENDING_PAYMENT";
  if (s === "rejected" || s === "cancelled") return "CANCELLED";
  if (s === "refunded" || s === "charged_back") return "REFUNDED";
  return "PENDING_PAYMENT";
}

type OrderItemDelegate = {
  findMany: (args: { where: { orderId: string } }) => Promise<{ variantId: string; quantity: number }[]>;
};
type VariantDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<{ id: string } | null>;
  update: (args: {
    where: { id: string };
    data: { stock: { increment: number } };
  }) => Promise<unknown>;
};

/**
 * Devuelve unidades al inventario al cancelar o reembolsar una orden.
 * Llamar solo al pasar a CANCELLED/REFUNDED desde un estado que aún no haya liberado stock (evita doble suma).
 */
async function releaseStockForOrderItems(
  tx: { orderItem: OrderItemDelegate; productVariant: VariantDelegate },
  orderId: string,
): Promise<void> {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
    if (!variant) continue;
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

export async function processPaymentWebhook(paymentId: string): Promise<string | null> {
  const trimmedId = paymentId.trim();
  if (!isMercadoPagoPaymentId(trimmedId)) {
    console.warn("[webhook] ID ignorado (no es payment id numérico):", paymentId);
    return null;
  }

  const payment = await mpGetPayment(trimmedId);
  if (!payment) {
    console.warn("[webhook] Pago no encontrado en MP:", trimmedId);
    return null;
  }

  const ext = payment.external_reference?.trim();
  if (!ext) return null;
  const orderId = ext;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const newStatus = mapPaymentToOrderStatus(payment.status);
  if (order.status === newStatus) {
    return newStatus;
  }

  await prisma.$transaction(async (tx) => {
    const cur = await tx.order.findUnique({ where: { id: orderId } });
    if (!cur || cur.status === newStatus) return;

    const releasesInventory =
      (newStatus === "CANCELLED" || newStatus === "REFUNDED") &&
      cur.status !== "CANCELLED" &&
      cur.status !== "REFUNDED";

    const upd = await tx.order.updateMany({
      where: { id: orderId, status: cur.status },
      data: { status: newStatus },
    });
    if (upd.count === 0) return;

    if (releasesInventory) {
      await releaseStockForOrderItems(tx, orderId);
    }
  });

  return newStatus;
}

export async function markOrderPaidIfPending(orderId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PAID" },
  });
}

const PAYMENT_HOLD_MS = 15 * 60 * 1000;

export async function expirePendingPaymentOrders(): Promise<number> {
  const now = new Date();
  const cutoffLegacy = new Date(now.getTime() - PAYMENT_HOLD_MS);

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      OR: [
        { expiresAt: { lt: now } },
        { expiresAt: null, createdAt: { lt: cutoffLegacy } },
      ],
    },
    include: { items: true },
  });

  let expiredCount = 0;
  for (const order of expiredOrders) {
    try {
      let cancelledThisPass = false;
      await prisma.$transaction(async (tx) => {
        const upd = await tx.order.updateMany({
          where: {
            id: order.id,
            status: "PENDING_PAYMENT",
            OR: [
              { expiresAt: { lt: now } },
              { expiresAt: null, createdAt: { lt: cutoffLegacy } },
            ],
          },
          data: { status: "CANCELLED" },
        });
        if (upd.count === 0) return;
        await releaseStockForOrderItems(tx, order.id);
        cancelledThisPass = true;
      });
      if (cancelledThisPass) expiredCount += 1;
    } catch (e) {
      console.error("[expirePendingPaymentOrders] order", order.id, e);
    }
  }
  return expiredCount;
}

export async function listAllOrdersAdmin() {
  await expirePendingPaymentOrders().catch((e) =>
    console.error("[listAllOrdersAdmin] expirePendingPaymentOrders", e),
  );
  const orders = await prisma.order.findMany({
    include: {
      ...ORDER_INCLUDE,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((o) => {
    const base = mapOrderToHttp(o as OrderLoaded);
    const fullName = [o.user?.profile?.firstName, o.user?.profile?.lastName].filter(Boolean).join(" ").trim();
    return {
      ...base,
      customerEmail: o.user?.email ?? null,
      customerName: fullName || null,
      customerPhone: o.user?.profile?.phone ?? null,
    };
  });
}

export async function patchOrderStatusAdmin(orderId: string, status: string) {
  const allowed = ["PENDING_PAYMENT", "PAID", "SHIPPED", "CANCELLED", "REFUNDED"];
  if (!allowed.includes(status)) throw new Error("Invalid status: " + status);
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) throw new Error("Order not found");

  await prisma.$transaction(async (tx) => {
    const releasesInventory =
      (status === "CANCELLED" || status === "REFUNDED") &&
      existing.status !== "CANCELLED" &&
      existing.status !== "REFUNDED";

    const upd = await tx.order.updateMany({
      where: { id: orderId, status: existing.status },
      data: { status },
    });
    if (upd.count === 0) {
      throw new Error("ORDER_CONFLICT");
    }

    if (releasesInventory) {
      await releaseStockForOrderItems(tx, orderId);
    }
  });

  const o = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  return mapOrderToHttp(o);
}
