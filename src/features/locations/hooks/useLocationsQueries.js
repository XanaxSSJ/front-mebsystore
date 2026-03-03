import { useQuery } from '@tanstack/react-query';
import { locationAPI } from '../api/locations.api';

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ['locations', 'departments'],
    queryFn: locationAPI.getDepartments,
  });
}

export function useProvincesQuery(department) {
  return useQuery({
    queryKey: ['locations', 'provinces', department],
    queryFn: () => locationAPI.getProvinces(department),
    enabled: !!department,
  });
}

export function useDistrictsQuery(department, province) {
  return useQuery({
    queryKey: ['locations', 'districts', department, province],
    queryFn: () => locationAPI.getDistricts(department, province),
    enabled: !!department && !!province,
  });
}

