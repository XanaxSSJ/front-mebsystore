import type { ReactNode } from "react";
import type { AddressHttp } from "./user";
import type { BrandHttp, CategoryHttp } from "./catalog";
import type { CartItem } from "./cart";
import type { OrderHttp, OrderItemHttp } from "./order";
import type { ProductAttribute, ProductListItem } from "./product";
import type { AttributeFilterGroup } from "@/features/products/utils/attributes";

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export interface ProductCardProps {
  product: ProductListItem;
}

export interface RelatedProductsProps {
  products: ProductListItem[];
}

export interface ProductFiltersProps {
  categories: CategoryHttp[];
  brands: BrandHttp[];
  attributeOptions: AttributeFilterGroup[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedAttributeValueIds: string[];
  onCategoryToggle: (id: string) => void;
  onBrandToggle: (id: string) => void;
  onAttributeValueToggle: (id: string) => void;
  onClearAll: () => void;
  onClearAttributeFilters: () => void;
  hasAnyFilters: boolean;
  hasAttributeFilters: boolean;
}

export interface ProductAttributesProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (attrName: string, valueId: string) => void;
}

export interface AddToCartSectionProps {
  quantity: number;
  setQuantity: (n: number) => void;
  onAddToCart: () => void;
  displayStock: number;
  displayPrice: number;
  isSelectionIncomplete: boolean;
}

export interface ProductImageGalleryProps {
  displayImage: string | null;
  productName: string;
  additionalImages: (string | null | undefined)[];
  displayStock: number;
  onSelectImage?: (url: string) => void;
}

export interface OrderProductItemProps {
  item: OrderItemHttp;
  product?: ProductListItem | null;
  onViewProduct?: (productId: string) => void;
  showReorder?: boolean;
  showSubtotal?: boolean;
}

export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
}

export interface CheckoutSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onPay: () => void;
  processing: boolean;
  hasShippingAddress: boolean;
}

export interface CheckoutAddressProps {
  addresses: AddressHttp[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onManageAddresses: () => void;
}

export type ProductsById = Record<string, ProductListItem>;

export type OrdersWithProducts = {
  order: OrderHttp;
  products: ProductsById;
};
