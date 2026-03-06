import { fetchAPI } from '@/lib/http/client';

export const locationAPI = {
    getDepartments: async () => {
        return await fetchAPI('/user/locations/departments', {
            errorMessage: 'Error al obtener departamentos',
        });
    },

    getProvinces: async (department) => {
        return await fetchAPI(`/user/locations/provinces?department=${encodeURIComponent(department)}`, {
            errorMessage: 'Error al obtener provincias',
        });
    },

    getDistricts: async (department, province) => {
        return await fetchAPI(
            `/user/locations/districts?department=${encodeURIComponent(department)}&province=${encodeURIComponent(province)}`,
            { errorMessage: 'Error al obtener distritos' },
        );
    },
};
