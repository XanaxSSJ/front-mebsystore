"use client";

import Link from 'next/link';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';

function ColeccionesPage() {
  const { data: categoriesData, isLoading, error } = useCategoriesQuery();
  const categories = categoriesData ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background-light text-surface selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/60 mb-4 block">
            Curación
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-surface mb-6">
            Explora <span className="italic font-light">Colecciones</span>
          </h1>
          <p className="text-lg md:text-xl text-surface/60 leading-relaxed">
            Descubre nuestras categorías. Encuentra la silueta que habla de tu estilo.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-surface/60 animate-pulse">Cargando colecciones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32 max-w-lg mx-auto">
            <p className="text-surface/60 mb-8">{error.message}</p>
            <Link
              href="/"
              className="px-6 py-3 bg-surface text-white font-bold rounded-xl hover:bg-surface/90 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-surface/60 text-lg">Aún no hay colecciones.</p>
            <Link
              href="/productos"
              className="inline-block mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Ver tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            {categories.map((category, index) => {
              const isLarge = index === 0;
              return (
                <div
                  key={category.id}
                  className={`group relative overflow-hidden rounded-3xl bg-white ${
                    isLarge ? 'md:col-span-8' : index === 1 ? 'md:col-span-4' : 'md:col-span-6'
                  }`}
                >
                  <Link href={`/categoria/${category.slug}`} className="block h-full">
                    <div
                      className={`aspect-[16/10] md:aspect-auto overflow-hidden ${
                        isLarge ? 'md:h-[650px]' : index === 1 ? 'md:h-[650px] aspect-[4/5]' : 'aspect-[4/3]'
                      }`}
                    >
                      <img
                        alt={category.name}
                        src={PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                      <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        {category.name}
                      </h2>
                      <div className="inline-flex items-center gap-3 text-white font-bold tracking-widest uppercase text-xs transition-all duration-300 group-hover:tracking-[0.15em]">
                        Ver colección
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ColeccionesPage;
