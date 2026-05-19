import { useQuery } from "@tanstack/react-query";
import { useAuthStatusQuery } from "@/features/auth/hooks/useAuthStatusQuery";
import { orderAPI } from "../api/orders.api";

export function useMyOrdersQuery() {
  const authStatus = useAuthStatusQuery();

  return useQuery({
    queryKey: ["orders", "me"],
    queryFn: orderAPI.getMyOrders,
    enabled: Boolean(authStatus.data),
    retry: false,
  });
}
