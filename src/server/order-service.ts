import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { mpCreatePreference, mpGetPayment } from "@/server/mercadopago-api";
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

export async function createOrder(
  email: string,
  body: { items: { productId: string; variantId: string; quantity: number }[]; shippingAddressId: string },
) {
  const userId = await requireUserId(email);
  const items = body.items;
  if (!items?.length) throw new Error("Order must have at least one item");
  if (!body.shippingAddressId) throw new Error("Shipping address is required");

  const address = await prisma.address.findFirst({
    where: { id: body.shippingAddressId, userId },
  });
  if (!address) throw new Error("Address not found with id: " + body.shippingAddressId);
  await validateUbigeo(address.department, address.province, address.district);

  const orderId = randomUUID();
  const now = new Date();
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
  const userId = await requireUserId(email);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrderToHttp);
}

export async function getOrderById(email: string, orderId: string) {
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
  if (s === "refunded" || s === "charged_back") return "CANCELLED";
  return "PENDING_PAYMENT";
}

export async function processPaymentWebhook(paymentId: string): Promise<string | null> {
  const payment = await mpGetPayment(paymentId);
  const ext = payment.external_reference;
  if (!ext) return null;
  const orderId = ext;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const newStatus = mapPaymentToOrderStatus(payment.status);
  if (order.status !== newStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
  return newStatus;
}

export async function markOrderPaidIfPending(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order && order.status === "PENDING_PAYMENT") {
    await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });
  }
}

export async function listAllOrdersAdmin() {
  const orders = await prisma.order.findMany({
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrderToHttp);
}

export async function patchOrderStatusAdmin(orderId: string, status: string) {
  const allowed = ["PENDING_PAYMENT", "PAID", "SHIPPED", "CANCELLED"];
  if (!allowed.includes(status)) throw new Error("Invalid status: " + status);
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) throw new Error("Order not found");
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  const o = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  return mapOrderToHttp(o);
}
