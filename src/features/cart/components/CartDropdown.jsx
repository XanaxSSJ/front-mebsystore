"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

function CartDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) =>
    state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  );

  useClickOutside(dropdownRef, onClose, isOpen);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full pt-2 w-80 z-[60]"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-surface/5 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface/5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-surface">
            Bolsa de compras ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
          </h4>
        </div>

        {/* Items */}
        <div className="max-h-96 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-surface/30 mb-3 block">shopping_bag</span>
              <p className="text-sm font-medium text-surface/70 mb-4">Tu carrito está vacío</p>
              <button
                type="button"
                onClick={() => { onClose(); router.push('/productos'); }}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Ver productos
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.variantId}
                className="p-5 flex gap-4 border-b border-surface/5 last:border-0"
              >
                <div className="w-16 h-20 bg-background-light rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={ensureHttps(item.imageUrl)}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface/30">
                      <span className="material-symbols-outlined text-2xl">image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h5 className="text-xs font-bold uppercase tracking-tight text-surface truncate">
                    {item.productName}
                  </h5>
                  {item.attributes?.length > 0 && (
                    <p className="text-[10px] text-surface/50 mt-0.5 truncate">
                      {item.attributes.map(a => `${a.name}: ${a.value}`).join(' / ')}
                    </p>
                  )}
                  <div className="flex justify-between items-center gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-surface/20 text-surface/70 hover:bg-surface/5 text-xs font-bold"
                      >
                        −
                      </button>
                      <span className="text-[10px] font-bold text-surface min-w-[1.25rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-surface/20 text-surface/70 hover:bg-surface/5 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold text-surface">{formatPrice(item.price)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-surface/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-surface/60">Subtotal</span>
              <span className="text-sm font-bold text-surface">{formatPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-surface text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface/90 transition-all"
            >
              Ir al checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDropdown;
