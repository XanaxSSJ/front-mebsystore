export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export interface OrderShippingAddress {
  street: string;
  department: string;
  province: string;
  district: string;
}

export interface OrderItemHttp {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderHttp {
  id: string;
  userId: string;
  items: OrderItemHttp[];
  total: number;
  status: OrderStatus;
  shippingAddress: OrderShippingAddress | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface CreateOrderPayload {
  items: { productId: string; variantId: string; quantity: number }[];
  shippingAddressId: string;
}

export interface PaymentPreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}
