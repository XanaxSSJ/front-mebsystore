import { API_BASE_URL, defaultFetchOptions, getAuthHeaders } from '@/lib/http/client';

export const userAPI = {
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener perfil' }));
            throw new Error(error.message || 'Error al obtener perfil');
        }

        return await response.json();
    },

    updateProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            ...defaultFetchOptions,
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al actualizar perfil' }));
            throw new Error(error.error || error.message || 'Error al actualizar perfil');
        }

        return await response.json();
    },

    getAddresses: async () => {
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            ...defaultFetchOptions,
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al obtener direcciones' }));
            throw new Error(error.message || 'Error al obtener direcciones');
        }

        return await response.json();
    },

    createAddress: async (addressData) => {
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            ...defaultFetchOptions,
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(addressData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al crear dirección' }));
            throw new Error(error.error || error.message || 'Error al crear dirección');
        }

        return await response.json();
    },

    updateAddress: async (addressId, addressData) => {
        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
            ...defaultFetchOptions,
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(addressData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al actualizar dirección' }));
            throw new Error(error.error || error.message || 'Error al actualizar dirección');
        }

        return await response.json();
    },

    deleteAddress: async (addressId) => {
        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
            ...defaultFetchOptions,
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al eliminar dirección' }));
            throw new Error(error.error || error.message || 'Error al eliminar dirección');
        }
    },
};
