/**
 * Build grouped attribute filter options from a list of products.
 * Returns: [{ name: "Color", values: [{ value: "Rojo", attributeValueId: "..." }] }, ...]
 */
export function buildAttributeOptions(products) {
  const byName = new Map();
  for (const product of products) {
    if (!product.variants?.length) continue;
    for (const variant of product.variants) {
      const attrs = Array.isArray(variant.attributes) ? variant.attributes : [];
      for (const a of attrs) {
        if (!a?.attributeValueId) continue;
        const id = String(a.attributeValueId);
        const name = a.name || 'Atributo';
        if (!byName.has(name)) byName.set(name, new Map());
        if (!byName.get(name).has(id)) {
          byName.get(name).set(id, {
            value: a.value || id,
            attributeValueId: a.attributeValueId,
          });
        }
      }
    }
  }
  const result = [];
  byName.forEach((valuesMap, name) => {
    result.push({ name, values: Array.from(valuesMap.values()) });
  });
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
