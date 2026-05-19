import { fetchAPI } from "@/lib/http/client";
import type { CreateOrderPayload, OrderHttp, PaymentPreferenceResponse } from "@/types/order";

export const orderAPI = {
  create: async (orderData: CreateOrderPayload): Promise<OrderHttp> => {
    return fetchAPI<OrderHttp>("/orders", {
      method: "POST",
      body: orderData,
      errorMessage: "Error al crear la orden",
    });
  },

  getMyOrders: async (): Promise<OrderHttp[]> => {
    return fetchAPI<OrderHttp[]>("/orders/me", { errorMessage: "Error al obtener órdenes" });
  },

  getById: async (orderId: string): Promise<OrderHttp> => {
    return fetchAPI<OrderHttp>(`/orders/${orderId}`, {
      errorMessage: "Error al obtener la orden",
    });
  },

  createPaymentPreference: async (
    orderId: string,
    shippingCost: number,
  ): Promise<PaymentPreferenceResponse> => {
    return fetchAPI<PaymentPreferenceResponse>(`/orders/${orderId}/payment/preference`, {
      method: "POST",
      body: { shippingCost },
      errorMessage: "Error al crear preferencia de pago",
    });
  },
};
