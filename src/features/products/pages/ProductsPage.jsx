import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/shared/components/PageLayout';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useSearchStore } from '@/store/search.store';
import { productMatchesQuery } from '../utils/search';
import { buildAttributeOptions } from '../utils/attributes';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { useBrandsQuery } from '@/features/brands/hooks/useBrandsQuery';

const EMPTY_ARRAY = [];

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

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const query = searchQuery.trim();

    if (query) {
      result = result.filter((product) => productMatchesQuery(product, query));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(String(product.categoryId)));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(String(product.brandId)));
    }

    result.sort((a, b) => {
      if (sortOrder === 'price_asc') return a.price - b.price;
      if (sortOrder === 'price_desc') return b.price - a.price;
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategories, selectedBrands, sortOrder]);

  const isGlobalLoading = isLoading || categoriesLoading || brandsLoading;

  return (
    <PageLayout className="max-w-7xl mx-auto px-6 py-12 w-full">
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
          <ProductFilters
            categories={categories}
            brands={brands}
            attributeOptions={attributeOptions}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            selectedAttributeValueIds={selectedAttributeValueIds}
            onCategoryToggle={handleCategoryToggle}
            onBrandToggle={handleBrandToggle}
            onAttributeValueToggle={handleAttributeValueToggle}
            onClearAll={clearAllFilters}
            onClearAttributeFilters={clearAttributeFilters}
            hasAnyFilters={hasAnyFilters}
            hasAttributeFilters={hasAttributeFilters}
          />

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
    </PageLayout>
  );
}

export default ProductsPage;
