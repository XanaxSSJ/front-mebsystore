import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../api/products.api';

/**
 * @param {Object} [options]
 * @param {string[]} [options.attributeValueIds] - filter by variant attribute value IDs
 * @param {boolean} [options.inStockOnly] - only products with at least one variant in stock
 */
export function useProductsQuery(options = {}) {
  const { attributeValueIds, inStockOnly } = options;
  const hasFilters = (attributeValueIds?.length > 0) || inStockOnly;

  return useQuery({
    queryKey: ['products', attributeValueIds ?? [], inStockOnly ?? false],
    queryFn: () =>
      hasFilters
        ? productAPI.getAllWithFilters({ attributeValueIds: attributeValueIds ?? null, inStockOnly: inStockOnly ?? false })
        : productAPI.getAll(),
  });
}

