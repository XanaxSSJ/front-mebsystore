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
        <Link
            href={`/producto/${product.id}`}
            className="group relative bg-[#1a1a1a]/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(75,0,130,0.3)] hover:border-purple-500/30 flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-white/5">
                {product.imageUrl ? (
                    <img
                        src={ensureHttps(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Add to cart button over image (top-right) */}
                {product.stock > 0 && (
                    <button
                        onClick={handleAddToCart}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 hover:scale-110"
                        aria-label="Agregar al carrito"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                )}

                {/* Sold out badge */}
                {product.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Sold Out
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div>
                    <h3 className="text-white font-medium text-base leading-snug line-clamp-3 group-hover:text-purple-300 transition-colors">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Price</span>
                        <span className="text-xl font-bold text-white tracking-tight">{formatPrice(product.price)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
