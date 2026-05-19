import { useQuery } from "@tanstack/react-query";
import { locationAPI } from "../api/locations.api";

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["locations", "departments"],
    queryFn: locationAPI.getDepartments,
  });
}

export function useProvincesQuery(department: string | undefined) {
  return useQuery({
    queryKey: ["locations", "provinces", department],
    queryFn: () => locationAPI.getProvinces(department!),
    enabled: Boolean(department),
  });
}

export function useDistrictsQuery(department: string | undefined, province: string | undefined) {
  return useQuery({
    queryKey: ["locations", "districts", department, province],
    queryFn: () => locationAPI.getDistricts(department!, province!),
    enabled: Boolean(department && province),
  });
}
