import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import PageLayout from '@/shared/components/PageLayout';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

function CartPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <PageLayout className="flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-surface/30">shopping_bag</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-surface">Tu carrito está vacío</h1>
          <p className="text-surface/50 mb-8 max-w-md text-center font-medium">
            Parece que aún no has agregado productos a tu carrito.
          </p>
          <button
            onClick={() => router.push('/productos')}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Ver productos
          </button>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="px-6 md:px-16 lg:px-24 py-12 max-w-[1600px] mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Tu Carrito</h1>
          <p className="text-surface/50 mt-2 font-medium">Explora nuestros productos y agrega lo que necesites a tu carrito.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart items */}
          <div className="flex-grow">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-surface/10 text-xs font-bold uppercase tracking-widest text-surface/50">
              <div className="col-span-6">Detalles del producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-surface/5">
              {cartItems.map((item) => (
                <div key={item.variantId} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-5 items-center">
                  {/* Product details */}
                  <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm">
                      {item.imageUrl ? (
                        <img
                          src={ensureHttps(item.imageUrl)}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-surface/20">
                          <span className="material-symbols-outlined text-2xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-surface leading-tight truncate">{item.productName}</h3>
                      {item.attributes?.length > 0 && (
                        <p className="text-xs text-surface/50 font-medium mt-0.5 truncate">
                          {item.attributes.map(a => `${a.name}: ${a.value}`).join(' / ')}
                        </p>
                      )}
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-[10px] font-bold text-surface/30 hover:text-red-600 transition-colors mt-2 flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-2 text-center">
                    <span className="md:hidden text-[10px] font-bold text-surface/50 block mb-1 tracking-widest uppercase">Precio</span>
                    <span className="font-bold text-sm">{formatPrice(item.price)}</span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-2 flex justify-center">
                    <div className="flex items-center border border-primary/20 bg-white rounded-lg overflow-hidden h-9">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-primary hover:text-white transition-colors text-primary flex items-center"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold text-surface text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-primary hover:text-white transition-colors text-primary flex items-center"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-1 md:col-span-2 text-right">
                    <span className="md:hidden text-[10px] font-bold text-surface/50 block mb-1 tracking-widest uppercase">Subtotal</span>
                    <span className="font-bold text-sm text-surface">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue shopping */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-sm font-bold text-surface hover:text-primary transition-all group"
              >
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">west</span>
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-surface/5">
              <h2 className="text-2xl font-extrabold mb-8 text-surface">Resumen del pedido</h2>

              <div className="space-y-5 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-surface/50">Subtotal ({getTotalItems()} artículos)</span>
                  <span className="font-bold text-surface text-base">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface/50">Envío</span>
                  <div className="text-right">
                    <span className="font-bold text-primary text-xs uppercase tracking-widest">Gratis</span>
                    <p className="text-[10px] text-surface/30 mt-1 uppercase tracking-tight">Entrega express</p>
                  </div>
                </div>

                <div className="pt-8 mt-4 border-t border-surface/5">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-lg font-bold text-surface">Total</span>
                    <span className="text-3xl font-extrabold text-surface leading-none">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-16 font-extrabold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 group"
                  >
                    Ir al checkout
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">east</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-surface/5 space-y-5">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  <div>
                    <p className="text-xs font-bold text-surface uppercase tracking-wide">Pago seguro</p>
                    <p className="text-[11px] text-surface/50 mt-1 leading-relaxed">Tus datos están protegidos con encriptación estándar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <div>
                    <p className="text-xs font-bold text-surface uppercase tracking-wide">Envío rápido</p>
                    <p className="text-[11px] text-surface/50 mt-1 leading-relaxed">Recibe tu pedido en la puerta de tu casa.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
    </PageLayout>
  );
}

export default CartPage;
