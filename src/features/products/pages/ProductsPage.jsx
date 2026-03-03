import { useMemo } from 'react';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import ProductCard from '../components/ProductCard';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useSearchStore } from '@/store/search.store';
import { productMatchesQuery } from '../utils/search';

const EMPTY_ARRAY = [];

function ProductsPage() {
  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery();

  const searchQuery = useSearchStore((state) => state.searchQuery);

  const products = productsData ?? EMPTY_ARRAY;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return products;
    return products.filter((product) => productMatchesQuery(product, query));
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-20" style={{ paddingTop: '130px' }}>
        <div className="mb-12 text-center relative z-10">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-family-display)' }}>
              Productos
            </h1>
            <div className="absolute -bottom-2 left-0 w-full h-20 bg-purple-500/20 blur-3xl rounded-full -z-10"></div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mt-4">
            Descubre nuestra colección completa de productos premium, diseñados para realzar tu esencia.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg">Error loading products: {error.message || 'Unknown error'}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-3xl p-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Products Found</h2>
              <p className="text-gray-400">
                It looks like our inventory is currently empty. Please check back later.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductsPage;


