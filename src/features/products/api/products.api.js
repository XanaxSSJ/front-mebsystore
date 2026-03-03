import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const productAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/products`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener productos' }));
            throw new Error(error.message || 'Error al obtener productos');
        }

        return await response.json();
    },

    getById: async (productId) => {
        const allProducts = await productAPI.getAll();
        return allProducts.find((product) => String(product.id) === String(productId)) || null;
    },
};
