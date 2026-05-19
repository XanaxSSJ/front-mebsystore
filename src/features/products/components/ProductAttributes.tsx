import type { ProductAttributesProps } from "@/types/components";

function ProductAttributes({ attributes, selectedAttributes, onSelectAttribute }: ProductAttributesProps) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <>
      {attributes.map(attr => (
        <div key={attr.id} className="space-y-3">
          <div className="flex justify-between items-center max-w-sm">
            <label className="text-sm font-bold text-surface uppercase tracking-wider">{attr.displayName}</label>
          </div>
          <div className="flex flex-wrap gap-2 w-full max-w-full sm:max-w-sm">
            {attr.values.map(val => (
              <button
                key={val.id}
                type="button"
                onClick={() => onSelectAttribute(attr.id, val.id)}
                className={`min-h-11 py-2.5 px-4 rounded-lg transition-colors text-sm touch-manipulation ${selectedAttributes[attr.id] === val.id ? 'border-2 border-primary bg-primary/5 font-bold text-primary' : 'border border-surface/20 hover:border-primary font-medium text-surface'}`}
              >
                {val.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default ProductAttributes;
