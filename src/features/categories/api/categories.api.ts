import { fetchAPI } from "@/lib/http/client";
import type { CategoryHttp } from "@/types/catalog";

export const categoryAPI = {
  getAll: async (): Promise<CategoryHttp[]> => {
    return fetchAPI<CategoryHttp[]>("/categories", {
      errorMessage: "Error al obtener categorías",
    });
  },
};
