import { useQuery } from '@tanstack/react-query';
import { categoryAPI } from '../api/categories.api';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getAll,
  });
}

