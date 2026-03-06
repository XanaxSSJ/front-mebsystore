import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageLayout from '@/shared/components/PageLayout';
import ProductCard from '../components/ProductCard';
import { useSearchStore } from '@/store/search.store';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { productMatchesQuery } from '../utils/search';

function CategoryPage() {
  const { slug } = useParams();
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery();
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsQuery();

  const loading = categoriesLoading || productsLoading;
  const error = categoriesError || productsError;

  const category = useMemo(() => {
    if (!categoriesData) return null;
    return categoriesData.find((cat) => cat.slug === slug) ?? null;
  }, [categoriesData, slug]);

  const categoryProducts = useMemo(() => {
    if (!productsData || !category) return [];
    return productsData.filter(
      (product) => product.categoryId === category.id,
    );
  }, [productsData, category]);

  const [sortOrder, setSortOrder] = useState('newest');

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => productMatchesQuery(product, query));
    }

    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [categoryProducts, searchQuery, sortOrder]);

  return (
    <PageLayout className="w-full max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-surface/40 mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/productos" className="hover:text-primary transition-colors">Colecciones</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-surface">{category?.name || 'Categoría'}</span>
        </nav>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-surface/60 animate-pulse font-medium">Cargando categoría...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32 max-w-lg mx-auto">
            <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-6">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tight">Error</h1>
            <p className="text-surface/60 mb-8 font-medium">{String(error)}</p>
            <Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors inline-block">
              Volver al Inicio
            </Link>
          </div>
        ) : !category ? (
          <div className="text-center py-32 max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-surface mb-6 uppercase">Categoría No Encontrada</h1>
            <p className="text-lg text-surface/70 leading-relaxed font-medium mb-8">La categoría que buscas no existe o ha sido movida.</p>
            <Link href="/productos" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all inline-block hover:-translate-y-1">
              Ver Todos los Productos
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-surface mb-6 uppercase">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-lg text-surface/70 leading-relaxed font-medium">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                  <span className="text-surface/40">Total Items</span>
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                    {filteredProducts.length} Productos
                  </span>
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center justify-end gap-6 py-6 border-y border-surface/10 mb-12">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-surface/40">Ordenar Por</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold uppercase tracking-widest focus:ring-0 cursor-pointer p-0 pr-8"
                >
                  <option value="newest">Más Recientes</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="text-center py-20 bg-white border border-surface/5 rounded-3xl p-10 shadow-sm">
                  <div className="w-24 h-24 bg-surface/5 rounded-full flex items-center justify-center mx-auto mb-6 text-surface/40">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                  </div>
                  <h2 className="text-2xl font-black text-surface tracking-tight mb-2">No se encontraron productos</h2>
                  <p className="text-surface/60 font-medium">
                    Esta categoría no tiene productos disponibles actualmente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
    </PageLayout>
  );
}

export default CategoryPage;


