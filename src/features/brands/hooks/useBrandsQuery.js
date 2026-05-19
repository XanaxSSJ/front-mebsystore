import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_MS } from '@/lib/query-client';
import { brandAPI } from '../api/brands.api';

export function useBrandsQuery() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: brandAPI.getAll,
        staleTime: CATALOG_STALE_MS,
    });
}
