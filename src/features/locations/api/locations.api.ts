import { fetchAPI } from "@/lib/http/client";

export const locationAPI = {
  getDepartments: async (): Promise<string[]> => {
    return fetchAPI<string[]>("/user/locations/departments", {
      errorMessage: "Error al obtener departamentos",
    });
  },

  getProvinces: async (department: string): Promise<string[]> => {
    return fetchAPI<string[]>(
      `/user/locations/provinces?department=${encodeURIComponent(department)}`,
      { errorMessage: "Error al obtener provincias" },
    );
  },

  getDistricts: async (department: string, province: string): Promise<string[]> => {
    return fetchAPI<string[]>(
      `/user/locations/districts?department=${encodeURIComponent(department)}&province=${encodeURIComponent(province)}`,
      { errorMessage: "Error al obtener distritos" },
    );
  },
};
