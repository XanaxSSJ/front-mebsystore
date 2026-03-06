import { useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import ProductCard from '../components/ProductCard';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useSearchStore } from '@/store/search.store';
import { productMatchesQuery } from '../utils/search';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { useBrandsQuery } from '@/features/brands/hooks/useBrandsQuery';

const EMPTY_ARRAY = [];

const COLOR_HEX = {
  rojo: '#DC2626', red: '#DC2626',
  verde: '#16A34A', green: '#16A34A',
  azul: '#2563EB', blue: '#2563EB',
  negro: '#171717', black: '#171717',
  blanco: '#FAFAFA', white: '#FAFAFA',
  amarillo: '#EAB308', yellow: '#EAB308',
  naranja: '#EA580C', orange: '#EA580C',
  gris: '#737373', gray: '#737373', grey: '#737373',
  marrón: '#78350F', brown: '#78350F',
  beige: '#D4B896', ivory: '#FFFFF0', sand: '#C2B280',
  onyx: '#15173D', purple: '#982598', olive: '#556B2F',
};

function getColorHex(value) {
  if (!value || typeof value !== 'string') return '#E5E5E5';
  const key = value.trim().toLowerCase();
  return COLOR_HEX[key] ?? (key.startsWith('#') ? key : '#E5E5E5');
}

// Build attribute filter options from products: { attributeName: [ { value, attributeValueId } ], ... }
function buildAttributeOptions(products) {
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
          byName.get(name).set(id, { value: a.value || id, attributeValueId: a.attributeValueId });
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

function ProductsPage() {
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState([]);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery({
    attributeValueIds: selectedAttributeValueIds.length > 0 ? selectedAttributeValueIds : null,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useBrandsQuery();

  const searchQuery = useSearchStore((state) => state.searchQuery);
  const products = productsData ?? EMPTY_ARRAY;
  const categories = categoriesData ?? EMPTY_ARRAY;
  const brands = brandsData ?? EMPTY_ARRAY;

  const attributeOptions = useMemo(() => buildAttributeOptions(products), [products]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');

  const handleCategoryToggle = (categoryId) => {
    const id = String(categoryId);
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter(c => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleBrandToggle = (brandId) => {
    const id = String(brandId);
    if (selectedBrands.includes(id)) {
      setSelectedBrands(selectedBrands.filter(b => b !== id));
    } else {
      setSelectedBrands([...selectedBrands, id]);
    }
  };

  const handleAttributeValueToggle = (attributeValueId) => {
    const id = String(attributeValueId);
    setSelectedAttributeValueIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const clearAttributeFilters = () => setSelectedAttributeValueIds([]);
  const hasAttributeFilters = selectedAttributeValueIds.length > 0;
  const hasAnyFilters = hasAttributeFilters || selectedCategories.length > 0 || selectedBrands.length > 0;

  const clearAllFilters = () => {
    setSelectedAttributeValueIds([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  // Filtering and Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];
    const query = searchQuery.trim();

    // 1. Search Query
    if (query) {
      result = result.filter((product) => productMatchesQuery(product, query));
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(String(product.categoryId)));
    }

    // 3. Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(String(product.brandId)));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortOrder === 'price_asc') return a.price - b.price;
      if (sortOrder === 'price_desc') return b.price - a.price;
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0; // Default or 'popular'
    });

    return result;
  }, [products, searchQuery, selectedCategories, selectedBrands, sortOrder]);

  const isGlobalLoading = isLoading || categoriesLoading || brandsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background-light text-surface font-display selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-surface/40 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-surface/80">Todos los Productos</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-surface">
                Nuestro <span className="text-primary italic">Catalogo</span>
              </h1>
              <p className="text-surface/60 mt-3 max-w-xl">
                Descubre nuestra colección completa de elementos esenciales de primera calidad.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-surface/50 uppercase tracking-widest">Ordenar por:</span>
              <div className="relative group">
                <select
                  className="appearance-none bg-white border border-surface/10 rounded-xl px-6 py-3 pr-12 font-bold text-sm focus:ring-primary focus:border-primary cursor-pointer min-w-[200px]"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Más Recientes</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="popular">Más Populares</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface/40">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-12">
            {hasAnyFilters && (
              <div className="pb-4 border-b border-surface/5">
                <button
                  type="button"
                  onClick={clearAllFilters}
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
                      onChange={() => handleCategoryToggle(category.id)}
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
                      onChange={() => handleBrandToggle(brand.id)}
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
                onClick={clearAttributeFilters}
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
                          onClick={() => handleAttributeValueToggle(attributeValueId)}
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

          {/* Main Grid area */}
          <div className="flex-grow">
            {isGlobalLoading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-surface/5">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-surface/60 font-medium">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-32 bg-white rounded-3xl border border-surface/5 text-center">
                <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
                  <span className="material-symbols-outlined text-3xl">error</span>
                </div>
                <p className="text-red-500 font-bold text-lg">
                  Error al cargar productos: {error.message || 'Error desconocido'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="max-w-2xl mx-auto py-20 bg-white border border-surface/5 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-24 h-24 bg-surface/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-surface/40">search_off</span>
                </div>
                <h2 className="text-2xl font-black text-surface mb-2">No se encontraron productos</h2>
                <p className="text-surface/60">
                  {searchQuery
                    ? `No hay productos coincidiendo con "${searchQuery}". Intenta otra búsqueda.`
                    : 'Nuestro inventario está vacío en este momento. Por favor, vuelve más tarde.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination (Static layout as requested) */}
                {filteredProducts.length > 0 && (
                  <div className="mt-24 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-surface/10 hover:bg-white transition-all text-surface/40 hover:text-primary bg-white">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">1</button>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-surface/10 hover:bg-white transition-all font-bold bg-white text-surface">2</button>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-surface/10 hover:bg-white transition-all font-bold bg-white text-surface">3</button>
                    <span className="text-surface/30 px-2 font-bold">...</span>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-surface/10 hover:bg-white transition-all font-bold bg-white text-surface">12</button>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-surface/10 hover:bg-white transition-all text-surface/40 hover:text-primary bg-white">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductsPage;
