import { useQuery } from "@tanstack/react-query";
import { CATALOG_STALE_MS } from "@/lib/query-client";
import type { ProductFilters } from "../api/products.api";
import { productAPI } from "../api/products.api";

export function useProductsQuery(options: ProductFilters = {}) {
  const { attributeValueIds, inStockOnly } = options;
  const hasFilters = (attributeValueIds?.length ?? 0) > 0 || Boolean(inStockOnly);

  return useQuery({
    queryKey: ["products", attributeValueIds ?? [], inStockOnly ?? false],
    queryFn: () =>
      hasFilters
        ? productAPI.getAllWithFilters({
            attributeValueIds: attributeValueIds ?? null,
            inStockOnly: inStockOnly ?? false,
          })
        : productAPI.getAll(),
    staleTime: CATALOG_STALE_MS,
  });
}
