import { fetchAPI } from '@/lib/http/client';

export const brandAPI = {
    getAll: async () => {
        return await fetchAPI('/brands', { errorMessage: 'Error al obtener marcas' });
    },
};
