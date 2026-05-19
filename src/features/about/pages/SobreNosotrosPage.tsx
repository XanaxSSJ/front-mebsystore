"use client";

import Link from 'next/link';
import PageLayout from '@/shared/components/PageLayout';

function SobreNosotrosPage() {
  return (
    <PageLayout className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/60 mb-4 block">
            Nuestra historia
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-surface mb-6">
            Sobre <span className="italic font-light">Nosotros</span>
          </h1>
          <p className="text-lg md:text-xl text-surface/60 leading-relaxed">
            Conoce el equipo y los valores detrás de Mebsy.
          </p>
        </header>

        <div className="prose prose-lg max-w-3xl mx-auto text-surface/80">
          <p>
            Bienvenido a Mebsy. Creemos en la calidad, el diseño consciente y una experiencia de compra excepcional.
          </p>
          <p>
            Esta página puede ampliarse con tu historia, equipo, sostenibilidad o lo que desees destacar.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 mt-8 text-primary font-bold hover:underline"
          >
            Ver tienda
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
    </PageLayout>
  );
}

export default SobreNosotrosPage;
