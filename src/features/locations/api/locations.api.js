import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const locationAPI = {
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/user/locations/departments`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener departamentos' }));
            throw new Error(error.message || 'Error al obtener departamentos');
        }

        return await response.json();
    },

    getProvinces: async (department) => {
        const response = await fetch(
            `${API_BASE_URL}/user/locations/provinces?department=${encodeURIComponent(department)}`,
            {
                ...defaultFetchOptions,
                method: 'GET',
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener provincias' }));
            throw new Error(error.message || 'Error al obtener provincias');
        }

        return await response.json();
    },

    getDistricts: async (department, province) => {
        const response = await fetch(
            `${API_BASE_URL}/user/locations/districts?department=${encodeURIComponent(department)}&province=${encodeURIComponent(province)}`,
            {
                ...defaultFetchOptions,
                method: 'GET',
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener distritos' }));
            throw new Error(error.message || 'Error al obtener distritos');
        }

        return await response.json();
    },
};
