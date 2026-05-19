export interface CartAttribute {
  name: string;
  value: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  attributes: CartAttribute[];
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export interface AddToCartInput {
  variantId: string;
  productId: string;
  productName: string;
  attributes?: CartAttribute[];
  price: number;
  imageUrl?: string | null;
}
