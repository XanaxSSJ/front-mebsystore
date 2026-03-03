import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../api/auth.api';

export function useAuthStatusQuery() {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: authAPI.checkAuth,
  });
}

