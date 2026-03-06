import { getColorHex } from '@/lib/colors';

function ProductFilters({
  categories,
  brands,
  attributeOptions,
  selectedCategories,
  selectedBrands,
  selectedAttributeValueIds,
  onCategoryToggle,
  onBrandToggle,
  onAttributeValueToggle,
  onClearAll,
  onClearAttributeFilters,
  hasAnyFilters,
  hasAttributeFilters,
}) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-12">
      {hasAnyFilters && (
        <div className="pb-4 border-b border-surface/5">
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors w-full bg-primary/5 hover:bg-primary/10 py-3 rounded-lg justify-center"
          >
            <span className="material-symbols-outlined text-sm">clear_all</span>
            Limpiar filtros
          </button>
        </div>
      )}

      <div>
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-surface mb-6">
          Categoría
        </h4>
        <div className="space-y-3">
          {categories.map(category => (
            <label key={category.id} className="flex items-center gap-3 group cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(String(category.id))}
                onChange={() => onCategoryToggle(category.id)}
                className="w-5 h-5 rounded border-surface/10 text-primary focus:ring-primary"
              />
              <span className={`text-sm ${selectedCategories.includes(String(category.id)) ? 'font-bold text-primary' : 'font-medium text-surface/70 group-hover:text-primary transition-colors'}`}>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-surface mb-6">
          Marca
        </h4>
        <div className="space-y-3">
          {brands.map(brand => (
            <label key={brand.id} className="flex items-center gap-3 group cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(String(brand.id))}
                onChange={() => onBrandToggle(brand.id)}
                className="w-5 h-5 rounded border-surface/10 text-primary focus:ring-primary"
              />
              <span className={`text-sm ${selectedBrands.includes(String(brand.id)) ? 'font-bold text-primary' : 'font-medium text-surface/70 group-hover:text-primary transition-colors'}`}>
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {attributeOptions.length > 0 && hasAttributeFilters && (
        <button
          type="button"
          onClick={onClearAttributeFilters}
          className="text-xs text-primary hover:underline mb-2"
        >
          Limpiar filtros de atributos
        </button>
      )}
      {attributeOptions.map(({ name, values }) => {
        const isColorLike = /color|colour|cor/i.test(name);
        return (
          <div key={name}>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-surface mb-3">{name}</h4>
            <div className="flex flex-wrap gap-2">
              {values.map(({ value, attributeValueId }) => {
                const id = String(attributeValueId);
                const isSelected = selectedAttributeValueIds.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onAttributeValueToggle(attributeValueId)}
                    className={`
                      min-w-[2.5rem] h-10 px-3 rounded-lg text-xs font-bold transition-all border-2 border-surface/10
                      hover:border-primary hover:text-primary
                      ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/10 text-primary' : 'ring-transparent text-surface'}
                      ${isColorLike ? 'rounded-full w-10 h-10 p-0' : ''}
                    `}
                    style={isColorLike ? { backgroundColor: getColorHex(value) } : undefined}
                    title={value}
                  >
                    {isColorLike ? '' : value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}

export default ProductFilters;
