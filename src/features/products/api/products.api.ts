import { fetchAPI } from "@/lib/http/client";
import type { ProductAttributesResponse, ProductHttp, ProductListItem } from "@/types/product";

function mapProductResponse(p: ProductHttp): ProductListItem {
  const baseImage = p.images?.find((img) => !img.variantId) || p.images?.[0];
  return {
    ...p,
    price: p.basePrice ?? p.variants?.[0]?.price ?? 0,
    imageUrl: baseImage?.imageUrl ?? null,
    stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? 0,
  };
}

export type ProductFilters = {
  attributeValueIds?: string[] | null;
  inStockOnly?: boolean;
};

export const productAPI = {
  getAll: async (): Promise<ProductListItem[]> => {
    const raw = await fetchAPI<ProductHttp[]>("/products", {
      errorMessage: "Error al obtener productos",
    });
    return raw.map(mapProductResponse);
  },

  getAllWithFilters: async ({
    attributeValueIds = null,
    inStockOnly = false,
  }: ProductFilters = {}): Promise<ProductListItem[]> => {
    const params = new URLSearchParams();
    if (attributeValueIds && attributeValueIds.length > 0) {
      attributeValueIds.forEach((id) => params.append("attributeValueIds", id));
    }
    if (inStockOnly) params.set("inStockOnly", "true");
    const query = params.toString();
    const raw = await fetchAPI<ProductHttp[]>(`/products${query ? `?${query}` : ""}`, {
      errorMessage: "Error al obtener productos",
    });
    return raw.map(mapProductResponse);
  },

  getAttributes: async (productId: string): Promise<ProductAttributesResponse | null> => {
    try {
      return await fetchAPI<ProductAttributesResponse>(`/products/${productId}/attributes`, {
        errorMessage: "Error al obtener atributos",
      });
    } catch {
      return null;
    }
  },

  getById: async (productId: string): Promise<ProductListItem | null> => {
    try {
      const p = await fetchAPI<ProductHttp>(`/products/${productId}`, {
        errorMessage: "Error al obtener producto",
      });
      return mapProductResponse(p);
    } catch {
      return null;
    }
  },

  getByCategory: async (categoryId: string): Promise<ProductListItem[]> => {
    const params = new URLSearchParams({ categoryId: String(categoryId) });
    const raw = await fetchAPI<ProductHttp[]>(`/products?${params}`, {
      errorMessage: "Error al obtener productos de la categoría",
    });
    return raw.map(mapProductResponse);
  },

  getRelated: async (
    categoryId: string,
    excludeProductId: string,
    limit = 4,
  ): Promise<ProductListItem[]> => {
    const params = new URLSearchParams({
      categoryId: String(categoryId),
      excludeProductId: String(excludeProductId),
      limit: String(limit),
    });
    const raw = await fetchAPI<ProductHttp[]>(`/products?${params}`, {
      errorMessage: "Error al obtener productos relacionados",
    });
    return raw.map(mapProductResponse);
  },
};
