import { useQuery } from '@tanstack/react-query';
import { brandAPI } from '../api/brands.api';

export function useBrandsQuery() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: brandAPI.getAll,
    });
}
