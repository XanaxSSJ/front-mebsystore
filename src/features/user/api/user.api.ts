import { fetchAPI } from "@/lib/http/client";
import type { AddressHttp, AddressInput, ProfileUpdateInput, UserProfileHttp } from "@/types/user";

export const userAPI = {
  getProfile: async (): Promise<UserProfileHttp> => {
    return fetchAPI<UserProfileHttp>("/user/profile", {
      errorMessage: "Error al obtener perfil",
    });
  },

  updateProfile: async (profileData: ProfileUpdateInput): Promise<UserProfileHttp> => {
    return fetchAPI<UserProfileHttp>("/user/profile", {
      method: "PUT",
      body: profileData,
      errorMessage: "Error al actualizar perfil",
    });
  },

  getAddresses: async (): Promise<AddressHttp[]> => {
    return fetchAPI<AddressHttp[]>("/user/addresses", {
      errorMessage: "Error al obtener direcciones",
    });
  },

  createAddress: async (addressData: AddressInput): Promise<AddressHttp> => {
    return fetchAPI<AddressHttp>("/user/addresses", {
      method: "POST",
      body: addressData,
      errorMessage: "Error al crear dirección",
    });
  },

  updateAddress: async (
    addressId: string,
    addressData: AddressInput,
  ): Promise<AddressHttp> => {
    return fetchAPI<AddressHttp>(`/user/addresses/${addressId}`, {
      method: "PUT",
      body: addressData,
      errorMessage: "Error al actualizar dirección",
    });
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await fetchAPI(`/user/addresses/${addressId}`, {
      method: "DELETE",
      errorMessage: "Error al eliminar dirección",
    });
  },
};
