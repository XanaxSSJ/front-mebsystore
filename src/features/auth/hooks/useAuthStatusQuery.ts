import { useQuery } from "@tanstack/react-query";
import { USER_STALE_MS } from "@/lib/query-client";
import { authAPI } from "../api/auth.api";

export function useAuthStatusQuery() {
  return useQuery({
    queryKey: ["auth", "status"],
    queryFn: authAPI.checkAuth,
    staleTime: USER_STALE_MS,
  });
}
