import { API_BASE_URL, defaultFetchOptions } from '@/lib/http/client';

export const authAPI = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        return await response.json();
    },

    register: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
            throw new Error(error.message || 'Error al registrar usuario');
        }

        return await response.json();
    },

    logout: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            ...defaultFetchOptions,
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Error al cerrar sesión');
        }
    },

    checkAuth: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/status`, {
                ...defaultFetchOptions,
                method: 'GET',
            });
            if (response.ok) {
                const data = await response.json();
                return Boolean(data.authenticated);
            }
            return false;
        } catch {
            return false;
        }
    },
};
