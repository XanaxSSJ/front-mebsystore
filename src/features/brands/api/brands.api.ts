import { fetchAPI } from "@/lib/http/client";
import type { BrandHttp } from "@/types/catalog";

export const brandAPI = {
  getAll: async (): Promise<BrandHttp[]> => {
    return fetchAPI<BrandHttp[]>("/brands", { errorMessage: "Error al obtener marcas" });
  },
};
