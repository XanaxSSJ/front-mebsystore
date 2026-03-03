"use client";

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

function CartDropdown({ isOpen, onClose }) {
    const dropdownRef = useRef(null);
    const router = useRouter();
    const cartItems = useCartStore((state) => state.cartItems);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const subtotal = useCartStore(
        (state) =>
            state.cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            ),
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            return;
        }
        onClose();
        router.push('/checkout');
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="fixed top-20 right-4 w-[380px] max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(75,0,130,0.15)] border border-white/10 flex flex-col max-h-[calc(100vh-8rem)] z-[100] animate-fade-in origin-top-right transform transition-all overflow-hidden"
        >
            {/* Header */}
            <div className="border-b border-white/10 px-5 py-2 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                <h2 className="text-base font-bold text-white tracking-tight text-center flex items-center gap-2 !m-0">
                    Carrito
                </h2>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(75,0,130,0.2)]">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-white font-medium text-sm mb-1">Tu carrito está vacío</p>
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/productos');
                            }}
                            className="mt-4 px-5 py-2 bg-white/10 hover:bg-purple-600 text-white rounded-full text-xs font-medium transition-all"
                        >
                            Comprar Ahora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="flex gap-3 items-center group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                {/* Image */}
                                <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg border border-white/10 flex-shrink-0 overflow-hidden relative">
                                    {item.imageUrl ? (
                                        <img src={ensureHttps(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors truncate mb-0.5" style={{ fontSize: "18px" }}>
                                        {item.productName}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <p className="text-purple-400 font-bold text-sm">{formatPrice(item.price)}</p>

                                        <div className="flex items-center gap-1.5 bg-black/40 rounded-md p-0.5 border border-white/10">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-xs">-</button>
                                            <span className="text-[10px] font-medium w-3 text-center text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-xs">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
                <div className="border-t border-white/10 bg-white/5 backdrop-blur-md p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-xs">Subtotal</span>
                        <span className="text-white font-bold text-lg">{formatPrice(subtotal)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:shadow-[0_0_25px_rgba(109,40,217,0.5)] transform active:scale-[0.98]"
                    >
                        Ir a Pagar
                    </button>
                </div>
            )}
        </div>
    );
}

export default CartDropdown;
