import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_MS } from '@/lib/query-client';
import { productAPI } from '../api/products.api';

export function useRelatedProductsQuery(categoryId, excludeProductId, limit = 4) {
  return useQuery({
    queryKey: ['products', 'related', categoryId, excludeProductId, limit],
    queryFn: () => productAPI.getRelated(categoryId, excludeProductId, limit),
    enabled: Boolean(categoryId && excludeProductId),
    staleTime: CATALOG_STALE_MS,
  });
}
