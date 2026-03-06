function ProductAttributes({ attributes, selectedAttributes, onSelectAttribute }) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <>
      {attributes.map(attr => (
        <div key={attr.id} className="space-y-3">
          <div className="flex justify-between items-center max-w-sm">
            <label className="text-sm font-bold text-surface uppercase tracking-wider">{attr.displayName}</label>
          </div>
          <div className="flex flex-wrap gap-2 max-w-sm">
            {attr.values.map(val => (
              <button
                key={val.id}
                onClick={() => onSelectAttribute(attr.id, val.id)}
                className={`py-3 px-4 rounded transition-colors text-sm ${selectedAttributes[attr.id] === val.id ? 'border-2 border-primary bg-primary/5 font-bold text-primary' : 'border border-surface/20 hover:border-primary font-medium text-surface'}`}
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
