import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

function mapProductResponse(p) {
    return {
        ...p,
        price: p.basePrice ?? p.variants?.[0]?.price ?? 0,
        imageUrl: p.images?.[0]?.imageUrl ?? null,
        stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? 0,
    };
}

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

        const rawProducts = await response.json();
        return rawProducts.map(mapProductResponse);
    },

    /**
     * Get products with optional filters: attributeValueIds (array of UUIDs), inStockOnly (boolean).
     * Example: getAllWithFilters({ attributeValueIds: [uuid1, uuid2], inStockOnly: true })
     */
    getAllWithFilters: async ({ attributeValueIds = null, inStockOnly = false } = {}) => {
        const params = new URLSearchParams();
        if (attributeValueIds && attributeValueIds.length > 0) {
            attributeValueIds.forEach(id => params.append('attributeValueIds', id));
        }
        if (inStockOnly) params.set('inStockOnly', 'true');
        const query = params.toString();
        const url = `${API_BASE_URL}/products${query ? `?${query}` : ''}`;
        const response = await fetch(url, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener productos' }));
            throw new Error(error.message || 'Error al obtener productos');
        }

        const rawProducts = await response.json();
        return rawProducts.map(mapProductResponse);
    },

    getAttributes: async (productId) => {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/attributes`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) return null;
        return await response.json();
    },

    getById: async (productId) => {
        const allProducts = await productAPI.getAll();
        return allProducts.find((product) => String(product.id) === String(productId)) || null;
    },
};
