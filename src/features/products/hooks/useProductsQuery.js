import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../api/products.api';

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productAPI.getAll,
  });
}

