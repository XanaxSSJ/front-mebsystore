import { fetchAPI } from '@/lib/http/client';

export const authAPI = {
    login: async (email, password) => {
        return await fetchAPI('/auth/login', {
            method: 'POST',
            body: { email, password },
            errorMessage: 'Error al iniciar sesión',
        });
    },

    register: async (email, password) => {
        return await fetchAPI('/auth/register', {
            method: 'POST',
            body: { email, password },
            errorMessage: 'Error al registrar usuario',
        });
    },

    logout: async () => {
        await fetchAPI('/auth/logout', {
            method: 'POST',
            errorMessage: 'Error al cerrar sesión',
        });
    },

    checkAuth: async () => {
        try {
            const data = await fetchAPI('/auth/status', {
                errorMessage: 'Error al verificar autenticación',
            });
            return Boolean(data.authenticated);
        } catch {
            return false;
        }
    },
};
