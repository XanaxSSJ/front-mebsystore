import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api/user.api';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';

export function useProfileQuery() {
  const authStatus = useAuthStatusQuery();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userAPI.getProfile,
    enabled: !!authStatus.data,
    retry: false,
  });
}

