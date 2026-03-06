import Link from 'next/link';
import ProductCard from './ProductCard';

function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-24 mb-10">
      <div className="flex justify-between items-end mb-8 border-b border-accent/20 pb-4">
        <div>
          <h3 className="text-3xl font-extrabold text-surface">Completa el Look</h3>
          <p className="text-surface/60 mt-1 font-medium">Recomendados para ti basados en esta categoría</p>
        </div>
        <Link href="/productos" className="hidden md:flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all">
          Ver todo <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <Link href="/productos" className="md:hidden mt-8 flex items-center justify-center gap-1 text-primary font-bold">
        Ver todo <span className="material-symbols-outlined">arrow_forward</span>
      </Link>
    </section>
  );
}

export default RelatedProducts;
