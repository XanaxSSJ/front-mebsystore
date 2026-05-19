import type { ProductListItem } from "@/types/product";

export interface AttributeFilterValue {
  value: string;
  attributeValueId: string;
}

export interface AttributeFilterGroup {
  name: string;
  values: AttributeFilterValue[];
}

/**
 * Build grouped attribute filter options from a list of products.
 */
export function buildAttributeOptions(products: ProductListItem[]): AttributeFilterGroup[] {
  const byName = new Map<string, Map<string, AttributeFilterValue>>();
  for (const product of products) {
    if (!product.variants?.length) continue;
    for (const variant of product.variants) {
      const attrs = Array.isArray(variant.attributes) ? variant.attributes : [];
      for (const a of attrs) {
        if (!a?.attributeValueId) continue;
        const id = String(a.attributeValueId);
        const name = a.name || "Atributo";
        if (!byName.has(name)) byName.set(name, new Map());
        const group = byName.get(name)!;
        if (!group.has(id)) {
          group.set(id, {
            value: a.value || id,
            attributeValueId: a.attributeValueId,
          });
        }
      }
    }
  }
  const result: AttributeFilterGroup[] = [];
  byName.forEach((valuesMap, name) => {
    result.push({ name, values: Array.from(valuesMap.values()) });
  });
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
