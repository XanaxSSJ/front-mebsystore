import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../api/products.api";

export function useProductAttributesQuery(productId: string | undefined) {
  return useQuery({
    queryKey: ["product_attributes", productId],
    queryFn: () => productAPI.getAttributes(productId!),
    enabled: Boolean(productId),
  });
}
