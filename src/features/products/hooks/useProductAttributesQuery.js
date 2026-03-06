import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../api/products.api';

export function useProductAttributesQuery(productId) {
    return useQuery({
        queryKey: ['product_attributes', productId],
        queryFn: () => productAPI.getAttributes(productId),
        enabled: !!productId,
    });
}
