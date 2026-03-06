import { fetchAPI } from '@/lib/http/client';

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
        const raw = await fetchAPI('/products', { errorMessage: 'Error al obtener productos' });
        return raw.map(mapProductResponse);
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
        const raw = await fetchAPI(`/products${query ? `?${query}` : ''}`, {
            errorMessage: 'Error al obtener productos',
        });
        return raw.map(mapProductResponse);
    },

    getAttributes: async (productId) => {
        try {
            return await fetchAPI(`/products/${productId}/attributes`, {
                errorMessage: 'Error al obtener atributos',
            });
        } catch {
            return null;
        }
    },

    getById: async (productId) => {
        const allProducts = await productAPI.getAll();
        return allProducts.find((product) => String(product.id) === String(productId)) || null;
    },
};
