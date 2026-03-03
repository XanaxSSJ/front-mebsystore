import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const orderAPI = {
    create: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al crear la orden' }));
            throw new Error(error.error || error.message || 'Error al crear la orden');
        }

        return await response.json();
    },

    getMyOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/me`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener órdenes' }));
            throw new Error(error.message || 'Error al obtener órdenes');
        }

        return await response.json();
    },

    getById: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener la orden' }));
            throw new Error(error.message || 'Error al obtener la orden');
        }

        return await response.json();
    },

    createPaymentPreference: async (orderId, shippingCost) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment/preference`, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                shippingCost: shippingCost,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: `Error al crear preferencia de pago (${response.status})`,
            }));
            throw new Error(
                error.error || error.message || `Error al crear preferencia de pago (${response.status})`,
            );
        }

        return await response.json();
    },
};
