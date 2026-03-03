import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api/user.api';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';

export function useAddressesQuery() {
  const authStatus = useAuthStatusQuery();

  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userAPI.getAddresses,
    enabled: !!authStatus.data,
    retry: false,
  });
}

