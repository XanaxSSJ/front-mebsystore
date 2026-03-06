import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const brandAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/brands`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener marcas' }));
            throw new Error(error.message || 'Error al obtener marcas');
        }

        return await response.json();
    },
};
