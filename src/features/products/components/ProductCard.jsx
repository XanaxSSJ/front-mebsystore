"use client";

import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import OptimizedImage from '@/shared/components/OptimizedImage';

function ProductCard({ product }) {
    const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? product.stock ?? 0;

    return (
        <Link href={`/producto/${product.id}`} className="product-grid-item group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 p-2">
            <div className="relative aspect-[3/4] bg-background-light rounded-lg overflow-hidden mb-4">
                {product.imageUrl ? (
                    <OptimizedImage
                        src={product.imageUrl}
                        alt={product.name}
                        preset="card"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface/20 bg-gray-100">
                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>
                )}

                {totalStock <= 0 && (
                    <div className="absolute top-4 right-4 bg-red-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Agotado
                    </div>
                )}

                {product.price > 150 && totalStock > 0 && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Nuevo</span>
                )}
            </div>

            <div className="px-2 pb-2">
                <h3 className="text-lg font-bold text-surface line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-surface/50 mb-3 line-clamp-1">{product.description || 'Detalles Premium • Sostenible'}</p>
                <p className="text-xl font-extrabold text-primary">{formatPrice(product.price)}</p>
            </div>
        </Link>
    );
}

export default ProductCard;
