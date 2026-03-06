import { fetchAPI } from '@/lib/http/client';

export const userAPI = {
    getProfile: async () => {
        return await fetchAPI('/user/profile', { errorMessage: 'Error al obtener perfil' });
    },

    updateProfile: async (profileData) => {
        return await fetchAPI('/user/profile', {
            method: 'PUT',
            body: profileData,
            errorMessage: 'Error al actualizar perfil',
        });
    },

    getAddresses: async () => {
        return await fetchAPI('/user/addresses', { errorMessage: 'Error al obtener direcciones' });
    },

    createAddress: async (addressData) => {
        return await fetchAPI('/user/addresses', {
            method: 'POST',
            body: addressData,
            errorMessage: 'Error al crear dirección',
        });
    },

    updateAddress: async (addressId, addressData) => {
        return await fetchAPI(`/user/addresses/${addressId}`, {
            method: 'PUT',
            body: addressData,
            errorMessage: 'Error al actualizar dirección',
        });
    },

    deleteAddress: async (addressId) => {
        await fetchAPI(`/user/addresses/${addressId}`, {
            method: 'DELETE',
            errorMessage: 'Error al eliminar dirección',
        });
    },
};
