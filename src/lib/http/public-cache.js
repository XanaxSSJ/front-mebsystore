/** Cabeceras para GET públicos (catálogo, categorías, producto por id) */
export const PUBLIC_GET_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};
