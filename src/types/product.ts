export interface ProductVariantAttribute {
  name: string;
  value: string;
  attributeValueId: string;
}

export interface ProductVariantHttp {
  id: string;
  sku: string;
  price: number | null;
  stock: number;
  active: boolean;
  attributes: ProductVariantAttribute[];
}

export interface ProductImageHttp {
  id: string;
  imageUrl: string;
  sortOrder: number;
  variantId: string | null;
}

/** Respuesta JSON de `/api/products` (servidor). */
export interface ProductHttp {
  id: string;
  name: string;
  description: string | null;
  brandId: string;
  categoryId: string;
  basePrice: number | null;
  active: boolean;
  createdAt: string;
  variants: ProductVariantHttp[];
  images: ProductImageHttp[];
}

/** Producto enriquecido para listados y cards en el cliente. */
export interface ProductListItem extends ProductHttp {
  price: number;
  imageUrl: string | null;
  stock: number;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  sortOrder?: number;
}

export interface ProductAttribute {
  id: string;
  name?: string;
  displayName: string;
  values: ProductAttributeValue[];
}

export interface ProductAttributesResponse {
  productId: string;
  attributes: ProductAttribute[];
}
