import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../api/orders.api';

export function useOrderByIdQuery(orderId) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderAPI.getById(orderId),
    enabled: !!orderId,
  });
}

