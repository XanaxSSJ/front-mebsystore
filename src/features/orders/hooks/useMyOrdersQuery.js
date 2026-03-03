import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../api/orders.api';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';

export function useMyOrdersQuery() {
  const authStatus = useAuthStatusQuery();

  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: orderAPI.getMyOrders,
    enabled: !!authStatus.data,
    retry: false,
  });
}

