import { useQuery } from '@tanstack/react-query';
import { USER_STALE_MS } from '@/lib/query-client';
import { userAPI } from '../api/user.api';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';

export function useProfileQuery() {
  const { data: isAuthenticated } = useAuthStatusQuery();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userAPI.getProfile,
    enabled: Boolean(isAuthenticated),
    staleTime: USER_STALE_MS,
    retry: false,
  });
}

