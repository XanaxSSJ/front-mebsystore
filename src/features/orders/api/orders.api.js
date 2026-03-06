import { fetchAPI } from '@/lib/http/client';

export const orderAPI = {
    create: async (orderData) => {
        return await fetchAPI('/orders', {
            method: 'POST',
            body: orderData,
            errorMessage: 'Error al crear la orden',
        });
    },

    getMyOrders: async () => {
        return await fetchAPI('/orders/me', { errorMessage: 'Error al obtener órdenes' });
    },

    getById: async (orderId) => {
        return await fetchAPI(`/orders/${orderId}`, { errorMessage: 'Error al obtener la orden' });
    },

    createPaymentPreference: async (orderId, shippingCost) => {
        return await fetchAPI(`/orders/${orderId}/payment/preference`, {
            method: 'POST',
            body: { shippingCost },
            errorMessage: 'Error al crear preferencia de pago',
        });
    },
};
