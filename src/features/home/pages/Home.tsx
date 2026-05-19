"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PageLayout from '@/shared/components/PageLayout';
import ProductCard from '@/features/products/components/ProductCard';
import { useSearchStore } from '@/store/search.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { productMatchesQuery } from '@/features/products/utils/search';

const HeroCarousel = dynamic(() => import('@/features/home/components/HeroCarousel'), {
  ssr: false,
  loading: () => <div className="w-full h-[min(70vh,600px)] min-h-[320px] bg-surface/5 animate-pulse" />,
});

import type { ProductListItem } from "@/types/product";

const EMPTY_PRODUCTS: ProductListItem[] = [];

function Home() {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
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
    <PageLayout className="w-full">
        {!searchQuery && (
          <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 md:pt-20 md:pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border border-accent/30">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Nueva Colección Invierno</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-8xl font-black leading-[1.1] tracking-tight text-surface">
                  Refinada <br /><span className="text-primary italic">Simplicidad</span>
                </h1>
                <p className="text-lg md:text-xl text-surface/70 leading-relaxed max-w-lg">
                  Curando un mundo de esenciales de alta gama diseñados para el minimalista moderno. Donde la calidad se encuentra con la elegancia en cada puntada.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
                  <Link href="/colecciones" className="bg-primary text-white px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 inline-block text-center">
                    Explorar Colecciones
                  </Link>
                  <Link href="/productos" className="bg-white text-surface border border-surface/10 px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-surface hover:text-white transition-all inline-block text-center">
                    Ver Productos
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="aspect-[4/5] bg-background-light rounded-2xl overflow-hidden">
                    <img
                      src="https://i.pinimg.com/736x/d3/dd/00/d3dd00cf825bd5fa710191d948ca074a.jpg"
                      alt="Modelo de moda de alta gama con ropa minimalista"
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary flex items-center">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div>
                      <p className="text-xs text-surface/50 font-bold uppercase tracking-tighter">Calidad Certificada</p>
                      <p className="text-lg font-bold">100% Seda Orgánica</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!searchQuery && <HeroCarousel />}

        <section className="bg-white py-16 sm:py-24 md:py-32 md:rounded-t-[5rem] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-surface tracking-tight">
                  {searchQuery ? `Resultados de búsqueda para "${searchQuery}"` : 'Ultimos Agregados'}
                </h2>
                {!searchQuery && (
                  <p className="text-surface/60 mt-4 max-w-md">Descubre nuestras últimas novedades y encuentra lo que necesitas.</p>
                )}
              </div>
              {!searchQuery && (
                <Link href="/productos" className="flex items-center gap-2 font-bold text-primary group">
                  Ver Todos los Productos
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 bg-red-50 py-3 px-6 rounded-xl inline-block font-medium border border-red-100">
                  {error.message || 'Error al cargar productos'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-background-light rounded-3xl border border-surface/5">
                <p className="text-surface/60 text-lg mb-4">
                  {searchQuery ? 'No hay productos que coincidan con tu búsqueda.' : 'No hay productos disponibles en este momento.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="font-bold text-primary underline hover:text-surface transition-colors"
                  >
                    Limpiar Búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

    </PageLayout>
  );
}

export default Home;
