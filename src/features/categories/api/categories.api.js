import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const categoryAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener categorías' }));
            throw new Error(error.message || 'Error al obtener categorías');
        }

        return await response.json();
    },
};
