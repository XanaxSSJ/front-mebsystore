import { useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { useCartStore } from '@/store/cart.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useOrderByIdQuery } from '../hooks/useOrderByIdQuery';
import { ensureHttps } from '@/lib/url';
import { formatPrice, formatDateTime, formatDateLong } from '@/lib/format';

const EMPTY_ARRAY = [];

function getStatusDisplay(orderStatus, paymentStatus) {
  if (orderStatus === 'SHIPPED') {
    return {
      text: 'Order Shipped',
      color: 'green',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    };
  }

  if (paymentStatus === 'success' || orderStatus === 'PAID') {
    return {
      text: 'Payment Successful',
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  }

  if (paymentStatus === 'pending' || orderStatus === 'PENDING_PAYMENT') {
    return {
      text: 'Payment Pending',
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
      icon: (
        <svg className="w-6 h-6 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  }

  if (paymentStatus === 'failure' || orderStatus === 'CANCELLED') {
    return {
      text: 'Payment Declined',
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
      icon: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
  }

  return {
    text: 'Unknown Status',
    color: 'gray',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
    textColor: 'text-gray-400',
    icon: null,
  };
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const paymentStatus = searchParams.get('status'); // success, pending, failure

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderByIdQuery(orderId);

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useProductsQuery();

  const loading = orderLoading || productsLoading;

  const productsDataSafe = productsData ?? EMPTY_ARRAY;

  const products = useMemo(() => {
    const map = {};
    productsDataSafe.forEach((product) => {
      map[product.id] = product;
    });
    return map;
  }, [productsDataSafe]);

  useEffect(() => {
    if (orderError) {
      console.error('Error loading order:', orderError);
      router.push('/ordenes');
    }
  }, [orderError, router]);

  const handleBuyAgain = (orderItems) => {
    orderItems.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });
    router.push('/checkout');
  };

  const handleCompletePayment = () => {
    // Limpiar carrito primero para evitar duplicados
    clearCart();

    // Agregar productos de la orden pendiente al carrito
    order.items.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });

    // Navegar a checkout con el orderId para reutilizar la orden existente
    router.push(`/checkout?orderId=${order.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
            <button
              onClick={() => router.push('/ordenes')}
              className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              Volver a ordenes
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order?.status, paymentStatus);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full flex justify-center pt-24 pb-20">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          <OrderDetailHeader onBack={() => router.push('/ordenes')} />

          <OrderStatusBanner
            order={order}
            paymentStatus={paymentStatus}
            statusDisplay={statusDisplay}
          />

          <OrderInfoCard
            order={order}
            products={products}
            onViewProduct={(productId) => router.push(`/producto/${productId}`)}
            onCompletePayment={handleCompletePayment}
            onBuyAgain={() => handleBuyAgain(order.items)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrderDetailHeader({ onBack }) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a ordenes
      </button>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 mb-2">
        Detalles de la orden
      </h1>
      <p className="text-gray-400">Información completa de su orden</p>
    </div>
  );
}

function OrderStatusBanner({ order, paymentStatus, statusDisplay }) {
  const orderStatus = order?.status;

  return (
    <div
      className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4`}
    >
      <div className="flex-shrink-0 p-2 bg-black/20 rounded-full">
        {statusDisplay.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className={`text-lg font-bold mb-1 ${statusDisplay.textColor}`}>{statusDisplay.text}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          {orderStatus === 'SHIPPED' &&
            `Your order was shipped on ${formatDateLong(order.updatedAt || order.createdAt)}. You should receive it soon.`}
          {orderStatus === 'PAID' &&
            'Your payment was successful. Your order is being prepared and will be shipped soon.'}
          {orderStatus === 'PENDING_PAYMENT' &&
            'Your payment is being processed. We will notify you once confirmed.'}
          {orderStatus === 'CANCELLED' && 'We could not process your payment. Please try again.'}
          {!orderStatus && paymentStatus === 'success' && 'Your payment was successful.'}
          {!orderStatus && paymentStatus === 'pending' && 'Your payment is being processed.'}
          {!orderStatus && paymentStatus === 'failure' && 'We could not process your payment. Please try again.'}
        </p>
      </div>
    </div>
  );
}

function OrderInfoCard({ order, products, onViewProduct, onCompletePayment, onBuyAgain }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border-b border-white/5 bg-white/[0.02]">
        <div>
          <p className="text-xs text-gray-500 mb-1">Order Number</p>
          <p className="text-sm font-medium text-white break-all">{order.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm font-medium text-white">{formatDateTime(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg font-bold text-white">{formatPrice(order.total)}</p>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Dirección de envío
          </h3>
          <p className="text-base text-white leading-relaxed">
            {order.shippingAddress.street}, {order.shippingAddress.district},{' '}
            {order.shippingAddress.province}, {order.shippingAddress.department}
          </p>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Lista de productos
        </h3>
        <div className="space-y-6">
          {order.items.map((item) => {
            const product = products[item.productId];
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                  {product?.imageUrl ? (
                    <img
                      src={ensureHttps(product.imageUrl)}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white mb-1 text-base sm:text-lg break-words">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2 leading-relaxed line-clamp-2">
                        {product?.description || 'Premium quality product'}
                      </p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-white">
                        {formatPrice(item.unitPrice)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Subtotal: {formatPrice(item.subtotal)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => onViewProduct(item.productId)}
                      className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
          {order.status === 'PENDING_PAYMENT' ? (
            <button
              onClick={onCompletePayment}
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-900/20"
            >
              Completar pago
            </button>
          ) : (
            <button
              onClick={onBuyAgain}
              className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
            >
              Comprar de nuevo todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;