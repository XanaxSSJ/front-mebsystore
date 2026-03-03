import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return categoryProducts;
    return categoryProducts.filter((product) =>
      productMatchesQuery(product, query),
    );
  }, [categoryProducts, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse">Loading category...</p>
            </div>
          ) : error ? (
            <div className="text-center py-32 max-w-lg mx-auto">
              <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-400 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Error</h1>
              <p className="text-gray-400 mb-8">{error}</p>
              <Link href="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                Return Home
              </Link>
            </div>
          ) : !category ? (
            <div className="text-center py-32 max-w-lg mx-auto">
              <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
              <p className="text-gray-400 mb-8">The category you are looking for does not exist.</p>
              <Link href="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                Return Home
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-12 text-center relative z-10">
                <div className="inline-block relative">
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-family-display)' }}>
                    {category.name}
                  </h1>
                  <div className="absolute -bottom-2 left-0 w-full h-20 bg-purple-500/20 blur-3xl rounded-full -z-10"></div>
                </div>
                {category.description && (
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg mt-4">
                    {category.description}
                  </p>
                )}
              </div>

              {filteredProducts.length === 0 ? (
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
                      This category currently has no products available.
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
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CategoryPage;


