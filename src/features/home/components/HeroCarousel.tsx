"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

const CAROUSEL_SLIDES = [
  {
    img: "https://i.pinimg.com/736x/98/6e/cc/986eccf7e45d4347f06e591b65e6b1f1.jpg",
    alt: "Estilo de vida de moda sostenible",
    overlay: "bg-black/20",
    title: "Vida Diaria Elevada",
    desc: "Descubre nuestro compromiso con la elegancia sostenible y la artesanía atemporal.",
  },
  {
    img: "https://i.pinimg.com/736x/83/58/a7/8358a78e8a19f6976662d392e728fef6.jpg",
    alt: "Ropa minimalista",
    overlay: "bg-black/30",
    title: "Solsticio de Invierno",
    desc: "La paleta de la temporada: Tonos cálidos de tierra y texturas lujosas.",
  },
  {
    img: "https://i.pinimg.com/736x/30/cb/24/30cb24bac14870beed5ff2cbf8322993.jpg",
    alt: "Ropa exterior premium",
    overlay: "bg-black/25",
    title: "Lujo Consciente",
    desc: "Materiales de origen ético diseñados para durar toda la vida.",
  },
];

export default function HeroCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = CAROUSEL_SLIDES.length;

  const scrollTo = useCallback((index: number) => {
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
      <div ref={containerRef} className="carousel-container flex overflow-x-auto w-full h-[min(70vh,600px)] min-h-[320px] sm:min-h-[400px]">
        {CAROUSEL_SLIDES.map((slide, i) => (
          <div key={i} className="carousel-item relative h-full">
            <img alt={slide.alt} className="w-full h-full object-cover" src={slide.img} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            <div className={`absolute inset-0 ${slide.overlay} flex flex-col items-center justify-center text-center px-6`}>
              <h2 className="text-white text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight drop-shadow-lg px-2">{slide.title}</h2>
              <p className="text-white/90 text-sm sm:text-lg md:text-xl max-w-xl mb-6 sm:mb-8 font-medium px-4">{slide.desc}</p>
              <Link
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white hover:text-surface transition-all duration-300"
                href="/productos"
              >
                Comprar Ahora
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollTo(activeIndex - 1)}
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white hover:text-surface transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20"
        aria-label="Anterior"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={() => scrollTo(activeIndex + 1)}
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white hover:text-surface transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20"
        aria-label="Siguiente"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Ir a diapositiva ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
