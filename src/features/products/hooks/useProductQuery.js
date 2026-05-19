import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_MS } from '@/lib/query-client';
import { productAPI } from '../api/products.api';

export function useProductQuery(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productAPI.getById(productId),
    enabled: Boolean(productId),
    staleTime: CATALOG_STALE_MS,
  });
}
