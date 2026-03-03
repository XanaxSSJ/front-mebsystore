import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

function CartPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-gray-400 mb-8 max-w-md text-center">Looks like you haven't added any premium gear to your cart yet.</p>
          <button
            onClick={() => router.push('/productos')}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Start Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full pt-10 pb-20">
        <div className="container px-4 mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-10 text-center md:text-left">Shopping Cart ({cartItems.length})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="group bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 flex items-start sm:items-center gap-6"
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden border border-white/5">
                    {item.imageUrl ? (
                      <img src={ensureHttps(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white mb-1 leading-tight group-hover:text-purple-400 transition-colors">
                        {item.productName}
                      </h3>
                      <p className="text-purple-400 text-sm font-medium mb-4">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity (Mobile) */}
                      <div className="flex sm:hidden items-center gap-3 mb-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >+</button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      {/* Quantity (Desktop) */}
                      <div className="hidden sm:flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-transparent hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span className="text-white font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-transparent hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >+</button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-white text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8 sticky top-24 shadow-2xl shadow-purple-900/10">
                <h2 className="text-2xl font-bold text-white mb-8">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-gray-500 text-sm">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span className="text-white font-medium">Included</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 font-medium">Total</span>
                    <span className="text-3xl font-bold text-white tracking-tight">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all transform hover:-translate-y-1 mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 text-gray-400 hover:text-white font-medium transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CartPage;


