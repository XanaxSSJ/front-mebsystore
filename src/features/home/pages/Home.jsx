"use client";

import { useMemo } from 'react';
import Link from "next/link"
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import ProductCard from '@/features/products/components/ProductCard';
import { useSearchStore } from '@/store/search.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { productMatchesQuery } from '@/features/products/utils/search';

const EMPTY_PRODUCTS = [];

function Home() {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery();

  const products = productsData ?? EMPTY_PRODUCTS;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return [...products].reverse();
    }
    return products.filter((product) => productMatchesQuery(product, query));
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full relative">
        {/* Hero Section */}
        {!searchQuery && (
          <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black z-0 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-black/0 to-transparent opacity-50 z-0 pointer-events-none" />

            <div className="container relative z-10 text-center px-4">
              <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-semibold tracking-wider mb-6 animate-fade-in">
                NUEVA COLLECCIÓN 2026
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Mas Luces <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Mas Performance
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Descubre hardware y accesorios pensados para realzar tu experiencia gaming.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/productos"
                  className="px-8 py-4 bg-purple-500 text-white font-bold rounded-full hover:bg-purple-600 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Descubre ahora
                </Link>
                <Link
                  href="/perfil"
                  className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all"
                >
                  Ver Cuenta
                </Link>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section id="products" className="py-24 relative bg-black">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Últimos Agregados'}
              </h2>
              {!searchQuery && (
                <Link href="/productos" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Ver todos los productos &rarr;
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 bg-red-900/20 py-2 px-4 rounded-lg inline-block">
                  {error.message || 'Error al cargar productos'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'No products found matching your search.' : 'No products available at the moment.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => window.scrollTo(0, 0)}
                    className="mt-4 text-purple-400 hover:text-purple-300 underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
