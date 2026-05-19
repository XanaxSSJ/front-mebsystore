import { QueryClient } from '@tanstack/react-query';

/** Catálogo y taxonomía: cambian poco en sesión de compra */
export const CATALOG_STALE_MS = 5 * 60 * 1000;
export const CATALOG_GC_MS = 30 * 60 * 1000;

/** Auth / perfil: validar con moderación */
export const USER_STALE_MS = 60 * 1000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: CATALOG_GC_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
