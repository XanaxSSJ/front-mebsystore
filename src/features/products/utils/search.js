/**
 * Devuelve true si el producto coincide con el término de búsqueda.
 * - Ignora mayúsculas/minúsculas.
 * - Divide la búsqueda en palabras: cada palabra debe aparecer en el nombre
 *   o la descripción del producto (búsqueda tipo "AND").
 *   Ejemplo: "mouse l" coincide con "Mouse Inalambrico Logitech".
 *
 * @param {{ name?: string, description?: string }} product
 * @param {string} rawQuery
 */
export function productMatchesQuery(product, rawQuery) {
    if (!rawQuery) return true;

    const query = rawQuery.trim().toLowerCase();
    if (!query) return true;

    const tokens = query.split(/\s+/);
    if (tokens.length === 0) return true;

    const name = (product.name ?? '').toLowerCase();
    const description = (product.description ?? '').toLowerCase();
    const haystack = `${name} ${description}`;

    return tokens.every((token) => haystack.includes(token));
}
