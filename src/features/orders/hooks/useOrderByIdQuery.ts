import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "../api/orders.api";

export function useOrderByIdQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderAPI.getById(orderId!),
    enabled: Boolean(orderId),
  });
}
