import { useQuery } from "@tanstack/react-query";
import { useAuthStatusQuery } from "@/features/auth/hooks/useAuthStatusQuery";
import { userAPI } from "../api/user.api";

export function useAddressesQuery() {
  const authStatus = useAuthStatusQuery();

  return useQuery({
    queryKey: ["user", "addresses"],
    queryFn: userAPI.getAddresses,
    enabled: Boolean(authStatus.data),
    retry: false,
  });
}
