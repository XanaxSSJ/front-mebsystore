import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { useCartStore } from '@/store/cart.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useMyOrdersQuery } from '../hooks/useMyOrdersQuery';
import { ensureHttps } from '@/lib/url';
import { formatPrice, formatDateShort } from '@/lib/format';

const EMPTY_ARRAY = [];

function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useMyOrdersQuery();

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useProductsQuery();

  // Redirección desde Mercado Pago a página de resultado
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      const params = new URLSearchParams(searchParams);
      router.replace(`/pago-exitoso?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Manejo de 401 / no autenticado
  useEffect(() => {
    if (ordersError && (ordersError.message?.includes('401') || ordersError.message?.includes('Unauthorized'))) {
      router.push('/login');
    }
  }, [ordersError, router]);

  const ordersDataSafe = ordersData ?? EMPTY_ARRAY;
  const productsDataSafe = productsData ?? EMPTY_ARRAY;

  const loading = ordersLoading || productsLoading;

  const products = useMemo(() => {
    const map = {};
    productsDataSafe.forEach((product) => {
      map[product.id] = product;
    });
    return map;
  }, [productsDataSafe]);

  const orders = useMemo(() => {
    return [...ordersDataSafe].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ordersDataSafe]);

  const handleBuyAgain = (orderItems) => {
    orderItems.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        // Agregar la cantidad que tenía en la orden
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'PENDING_PAYMENT':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full flex justify-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 mb-2">Historial de órdenes</h1>
            <p className="text-gray-400">
              Verifique el estado de sus órdenes recientes.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">You haven't placed any orders yet.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors">
                  {/* Resumen de la orden */}
                  <div className="p-5 sm:p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order Number</p>
                          <p className="text-sm font-medium text-white break-all">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Date</p>
                          <p className="text-sm font-medium text-white">{formatDateShort(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total</p>
                          <p className="text-sm font-medium text-white">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => router.push(`/orden/${order.id}`)}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/10 transition-colors"
                        >
                          Ver orden
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {order.items.map((item, itemIndex) => {
                      const product = products[item.productId];
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                        >
                          {/* Imagen del producto */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                            {product?.imageUrl ? (
                              <img
                                src={ensureHttps(product.imageUrl)}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white mb-1 text-base sm:text-lg break-words">
                                  {item.productName}
                                </h4>
                                <p className="text-sm text-gray-400 mb-2 leading-relaxed line-clamp-2">
                                  {product?.description || 'Premium quality product'}
                                </p>
                              </div>
                              <div className="text-left sm:text-right flex-shrink-0">
                                <p className="text-base font-semibold text-white">
                                  {formatPrice(item.unitPrice)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Qty: {item.quantity}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Botones de acción (ahora alineados a la izquierda en móvil) */}
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => handleBuyAgain([item])}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                              >
                                Comprar de nuevo
                              </button>
                              <span className="text-gray-700">|</span>
                              <button
                                onClick={() => router.push(`/producto/${item.productId}`)}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                              >
                                Ver producto
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrdersPage;


