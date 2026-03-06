import { fetchAPI } from '@/lib/http/client';

export const categoryAPI = {
    getAll: async () => {
        return await fetchAPI('/categories', { errorMessage: 'Error al obtener categorías' });
    },
};
