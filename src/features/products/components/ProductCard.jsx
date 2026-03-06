"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

function ProductCard({ product }) {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <Link href={`/producto/${product.id}`} className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 p-2">
            <div className="relative aspect-[3/4] bg-background-light rounded-lg overflow-hidden mb-4">
                {product.imageUrl ? (
                    <img
                        src={ensureHttps(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface/20 bg-gray-100">
                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>
                )}

                {product.stock > 0 ? (
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur text-surface py-3 rounded-lg font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
                    >
                        Agregar al Carrito
                    </button>
                ) : (
                    <div className="absolute top-4 right-4 bg-red-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Agotado
                    </div>
                )}

                {product.price > 150 && product.stock > 0 && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">New</span>
                )}

                <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-surface hover:text-primary transition-colors hover:scale-110 active:scale-95"
                >
                    <span className="material-symbols-outlined text-xl">favorite</span>
                </button>
            </div>

            <div className="px-2 pb-2">
                <h3 className="text-lg font-bold text-surface line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-surface/50 mb-3 line-clamp-1">{product.description || 'Premium Details • Sustainable'}</p>
                <p className="text-xl font-extrabold text-primary">{formatPrice(product.price)}</p>
            </div>
        </Link>
    );
}

export default ProductCard;
