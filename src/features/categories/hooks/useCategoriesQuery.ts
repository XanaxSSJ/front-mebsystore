import { useQuery } from "@tanstack/react-query";
import { CATALOG_STALE_MS } from "@/lib/query-client";
import { categoryAPI } from "../api/categories.api";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryAPI.getAll,
    staleTime: CATALOG_STALE_MS,
  });
}
