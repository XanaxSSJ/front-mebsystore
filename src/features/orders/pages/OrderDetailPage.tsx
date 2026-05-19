import { useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/shared/components/PageLayout';
import { useCartStore } from '@/store/cart.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useOrderByIdQuery } from '../hooks/useOrderByIdQuery';
import { getStatusDisplay, getStatusMessage } from '@/features/orders/utils/status';
import { ensureHttps } from '@/lib/url';
import { formatPrice, formatDateTime, formatDateLong } from '@/lib/format';
import OrderProductItem from '@/features/orders/components/OrderProductItem';
import { OrderDetailSkeleton } from '@/shared/components/page-skeletons';
import { getRouteParam } from '@/lib/params';
import type { ProductsById } from '@/types/components';
import type { OrderHttp, OrderItemHttp } from '@/types/order';
import type { ProductListItem } from '@/types/product';
import type { AddToCartInput } from '@/types/cart';
import type { StatusDisplay } from '@/features/orders/utils/status';

const EMPTY_PRODUCTS: ProductListItem[] = [];

function OrderDetailPage() {
  const { orderId: orderIdParam } = useParams();
  const orderId = getRouteParam(orderIdParam);
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const paymentStatus = searchParams.get('status');

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderByIdQuery(orderId);

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useProductsQuery();

  const loading = orderLoading;

  const productsDataSafe = productsData ?? EMPTY_PRODUCTS;

  const products = useMemo<ProductsById>(() => {
    const map: ProductsById = {};
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

  const addProductFromOrderItem = (item: OrderItemHttp) => {
    const product = products[item.productId];
    if (!product) return;
    const variant = product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
    if (!variant) return;
    const payload: AddToCartInput = {
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      attributes: variant.attributes.map((a) => ({ name: a.name, value: a.value })),
      price: variant.price ?? product.price,
      imageUrl: product.imageUrl,
    };
    for (let i = 0; i < item.quantity; i++) {
      addToCart(payload);
    }
  };

  const handleBuyAgain = (orderItems: OrderItemHttp[]) => {
    orderItems.forEach(addProductFromOrderItem);
    router.push('/checkout');
  };

  const handleCompletePayment = () => {
    if (!order) return;
    clearCart();
    order.items.forEach(addProductFromOrderItem);
    router.push(`/checkout?orderId=${order.id}`);
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <PageLayout className="w-full">
        <div className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface mb-4">Orden no encontrada</h1>
            <button
              onClick={() => router.push('/ordenes')}
              className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
            >
              Volver a ordenes
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const statusDisplay = getStatusDisplay(order?.status, paymentStatus);

  return (
    <PageLayout className="w-full">
      <div className="flex-1 w-full flex justify-center pt-24 pb-20">
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
      </div>
    </PageLayout>
  );
}

function OrderDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-4 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Volver a ordenes
      </button>
      <h1 className="text-3xl font-bold text-surface mb-2">
        Detalles de la orden
      </h1>
      <p className="text-surface/60">Información completa de su orden</p>
    </div>
  );
}

function OrderStatusBanner({
  order,
  paymentStatus,
  statusDisplay,
}: {
  order: OrderHttp;
  paymentStatus: string | null;
  statusDisplay: StatusDisplay;
}) {
  const orderStatus = order?.status;
  const shippedDate = formatDateLong(order?.updatedAt || order?.createdAt);
  const message = getStatusMessage(orderStatus, paymentStatus, shippedDate);

  return (
    <div
      className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4`}
    >
      <div className="flex-shrink-0 p-2 bg-surface/10 rounded-full">
        <span className={`material-symbols-outlined text-2xl ${statusDisplay.textColor}`}>
          {statusDisplay.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className={`text-lg font-bold mb-1 ${statusDisplay.textColor}`}>{statusDisplay.text}</h2>
        {message && (
          <p className="text-sm text-surface/60 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}

function OrderInfoCard({
  order,
  products,
  onViewProduct,
  onCompletePayment,
  onBuyAgain,
}: {
  order: OrderHttp;
  products: ProductsById;
  onViewProduct: (productId: string) => void;
  onCompletePayment: () => void;
  onBuyAgain: () => void;
}) {
  return (
    <div className="bg-white border border-surface/10 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border-b border-surface/5 bg-surface/5">
        <div>
          <p className="text-xs text-surface/40 mb-1">N° de Orden</p>
          <p className="text-sm font-medium text-surface break-all">{order.id}</p>
        </div>
        <div>
          <p className="text-xs text-surface/40 mb-1">Fecha</p>
          <p className="text-sm font-medium text-surface">{formatDateTime(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-surface/40 mb-1">Total</p>
          <p className="text-lg font-bold text-surface">{formatPrice(order.total)}</p>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="p-6 border-b border-surface/5">
          <h3 className="text-sm font-semibold text-surface/60 uppercase tracking-wider mb-3">
            Dirección de envío
          </h3>
          <p className="text-base text-surface leading-relaxed">
            {order.shippingAddress.street}, {order.shippingAddress.district},{' '}
            {order.shippingAddress.province}, {order.shippingAddress.department}
          </p>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-sm font-semibold text-surface/60 uppercase tracking-wider mb-4">
          Lista de productos
        </h3>
        <div className="space-y-6">
          {order.items.map((item) => {
            const product = products[item.productId];
            return (
              <OrderProductItem
                 key={item.id}
                 item={item}
                 product={product}
                 onViewProduct={(productId) => onViewProduct(productId)}
                 showReorder={false}
                 showSubtotal={true}
              />
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-surface/5 flex flex-col sm:flex-row justify-end gap-4">
          {order.status === 'PENDING_PAYMENT' ? (
            <button
              onClick={onCompletePayment}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              Completar pago
            </button>
          ) : (
            <button
              onClick={onBuyAgain}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
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
