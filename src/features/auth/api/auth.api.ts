import { fetchAPI } from "@/lib/http/client";

interface AuthStatusResponse {
  authenticated: boolean;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: { email, password },
      errorMessage: "Error al iniciar sesión",
    });
  },

  register: async (email: string, password: string) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: { email, password },
      errorMessage: "Error al registrar usuario",
    });
  },

  logout: async () => {
    await fetchAPI("/auth/logout", {
      method: "POST",
      errorMessage: "Error al cerrar sesión",
    });
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const data = await fetchAPI<AuthStatusResponse>("/auth/status", {
        errorMessage: "Error al verificar autenticación",
      });
      return Boolean(data.authenticated);
    } catch {
      return false;
    }
  },
};
