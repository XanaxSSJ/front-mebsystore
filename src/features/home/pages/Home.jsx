"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import PageLayout from '@/shared/components/PageLayout';
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
    <PageLayout className="w-full">
        {/* Hero Section */}
        {!searchQuery && (
          <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border border-accent/30">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Nueva Colección Invierno</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight text-surface">
                  Refinada <br /><span className="text-primary italic">Simplicidad</span>
                </h1>
                <p className="text-lg md:text-xl text-surface/70 leading-relaxed max-w-lg">
                  Curando un mundo de esenciales de alta gama diseñados para el minimalista moderno. Donde la calidad se encuentra con la elegancia en cada puntada.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/productos" className="bg-primary text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 inline-block">
                    Explorar Colección
                  </Link>
                  <Link href="/productos" className="bg-white text-surface border border-surface/10 px-10 py-5 rounded-xl font-bold text-lg hover:bg-surface hover:text-white transition-all inline-block">
                    Ver Productos
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="aspect-[4/5] bg-background-light rounded-2xl overflow-hidden">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw78qG7FFw9BYw30pHtTqHLiIIu1syYf6n4uxR8IF8RdrNvKQ_lsIJyNz2dU51PDecfRJAeubJ2TawjYdA-yVIfvHx6bjg3v6RdEwZoDKqzBUkxXsLCVJNTCyW2ken-0_9IkVmiYUp_qrrbtkdDEASIx3f6zPqKiGpOYM7lSSLUSMuXsV6FcNi3TO1H-vLMvvJe4W0mOGS_EDFBUM5K0ogDMURxtA-LGaeB_2jmFMBSA3vHNhq8x9ry8jELgfBEvx7wIWageE0wC4"
                      alt="Modelo de moda de alta gama con ropa minimalista"
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Stats Float */}
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

        {/* Carousel Section */}
        {!searchQuery && <HeroCarousel />}

        {/* Product Grid */}
        <section className="bg-white py-24 md:py-32 md:rounded-t-[5rem] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-surface tracking-tight">
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
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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

const CAROUSEL_SLIDES = [
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBw78qG7FFw9BYw30pHtTqHLiIIu1syYf6n4uxR8IF8RdrNvKQ_lsIJyNz2dU51PDecfRJAeubJ2TawjYdA-yVIfvHx6bjg3v6RdEwZoDKqzBUkxXsLCVJNTCyW2ken-0_9IkVmiYUp_qrrbtkdDEASIx3f6zPqKiGpOYM7lSSLUSMuXsV6FcNi3TO1H-vLMvvJe4W0mOGS_EDFBUM5K0ogDMURxtA-LGaeB_2jmFMBSA3vHNhq8x9ry8jELgfBEvx7wIWageE0wC4",
    alt: "Estilo de vida de moda sostenible",
    overlay: "bg-black/20",
    title: "Vida Diaria Elevada",
    desc: "Descubre nuestro compromiso con la elegancia sostenible y la artesanía atemporal.",
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZmm2t6UQDicxArVda4tNwrEvXy8kaIPja8Dr4LkuO_C7svtU23UOdTHKCuXKBlEADHbZ1Lt-vN1W3uWtSUF05IZguqxXVmL6me0zmlNIqMBpK9q-0LNw16mFJvRXozC_t_aC2CoDpiLXqGqX6c1TFwg0U7GqreyTSoo8h5sTbjwsJas1ocU_w-7W_vg2rQCYE8qaHg2NBzi41ySykBjCs-SipciKB3nzD7nxRD_AiS9XgU4LbhJscQ4Kj0-QP_EHhWdg2e2TzolI",
    alt: "Ropa minimalista",
    overlay: "bg-black/30",
    title: "Solsticio de Invierno",
    desc: "La paleta de la temporada: Tonos cálidos de tierra y texturas lujosas.",
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiF2JZEBbenWd2VGAxt8-qREfmVrmeBQD0MN27eSRh8BIleXwC0woTywZoygpvJpjA-SiKmwCM4t5m-7HXHUVv66dElbuMnwR68f614VQA5vkc6OlLu4tJ8pRwXihxnby9LxspfXpMr2dKVjVlM0hIFpU7RtDin2SUeBvSlMLrxNrzRnYAWZxnhfQaJ6p2eMD64LWEMVpaM2B8YdWdkcAhY_DwIdLREny5p22etVqy5Mn4kaT_ij2F1nVtyhQINHhDOuVfGz2IGpg",
    alt: "Ropa exterior premium",
    overlay: "bg-black/25",
    title: "Lujo Consciente",
    desc: "Materiales de origen ético diseñados para durar toda la vida.",
  },
];

function HeroCarousel() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = CAROUSEL_SLIDES.length;

  const scrollTo = useCallback((index) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = (index + totalSlides) % totalSlides;
    el.scrollTo({ left: clamped * el.offsetWidth, behavior: 'smooth' });
    setActiveIndex(clamped);
  }, [totalSlides]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => scrollTo(activeIndex + 1), 6000);
    return () => clearInterval(timer);
  }, [activeIndex, scrollTo]);

  return (
    <section className="w-full relative group pb-12">
      <div ref={containerRef} className="carousel-container flex overflow-x-auto w-full h-[600px]">
        {CAROUSEL_SLIDES.map((slide, i) => (
          <div key={i} className="carousel-item relative h-full">
            <img alt={slide.alt} className="w-full h-full object-cover" src={slide.img} />
            <div className={`absolute inset-0 ${slide.overlay} flex flex-col items-center justify-center text-center px-6`}>
              <h2 className="text-white text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg">{slide.title}</h2>
              <p className="text-white/90 text-lg md:text-xl max-w-xl mb-8 font-medium">{slide.desc}</p>
              <Link
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-surface transition-all duration-300"
                href="/productos"
              >
                Comprar Ahora
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollTo(activeIndex - 1)}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white hover:text-surface transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={() => scrollTo(activeIndex + 1)}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white hover:text-surface transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default Home;
