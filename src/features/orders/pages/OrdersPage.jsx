import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/shared/components/PageLayout';
import { useAuthRedirect } from '@/shared/hooks/useAuthRedirect';
import { useCartStore } from '@/store/cart.store';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useMyOrdersQuery } from '../hooks/useMyOrdersQuery';
import { getStatusColor, getStatusText } from '@/features/orders/utils/status';
import { formatDateShort, formatPrice } from '@/lib/format';
import OrderProductItem from '@/features/orders/components/OrderProductItem';

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

  useAuthRedirect(ordersError);

  // Redirección desde Mercado Pago a página de resultado
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      const params = new URLSearchParams(searchParams);
      router.replace(`/pago-exitoso?${params.toString()}`);
    }
  }, [searchParams, router]);

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



  if (loading) {
    return (
      <PageLayout className="w-full">
        <div className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-surface/60 animate-pulse">Cargando órdenes...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="w-full">
      <div className="flex-1 w-full flex justify-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-surface mb-2">Historial de órdenes</h1>
            <p className="text-surface/60">
              Verifique el estado de sus órdenes recientes.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border border-surface/5 rounded-2xl text-center py-20">
              <div className="w-20 h-20 bg-surface/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-surface/40">inventory_2</span>
              </div>
              <p className="text-surface/60 text-lg">Aún no has realizado ningún pedido.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors"
              >
                Empezar a comprar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-surface/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="p-5 sm:p-6 border-b border-surface/5 bg-surface/5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
                        <div>
                          <p className="text-xs text-surface/40 mb-1">N° de Orden</p>
                          <p className="text-sm font-medium text-surface break-all">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface/40 mb-1">Fecha</p>
                          <p className="text-sm font-medium text-surface">{formatDateShort(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface/40 mb-1">Total</p>
                          <p className="text-sm font-medium text-surface">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface/40 mb-1">Estado</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => router.push(`/orden/${order.id}`)}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          Ver orden
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    {order.items.map((item) => {
                      const product = products[item.productId];
                      return (
                        <OrderProductItem
                          key={item.id}
                          item={item}
                          product={product}
                          onViewProduct={(productId) => router.push(`/producto/${productId}`)}
                          showReorder={true}
                          showSubtotal={false}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default OrdersPage;
