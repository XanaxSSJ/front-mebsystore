import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { orderAPI } from '@/features/orders/api/orders.api';
import { useCartStore } from '@/store/cart.store';
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery';
import { useAddressesQuery } from '@/features/user/hooks/useAddressesQuery';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useOrderByIdQuery } from '@/features/orders/hooks/useOrderByIdQuery';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

const EMPTY_ARRAY = [];

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [processing, setProcessing] = useState(false);

  const orderIdParam = searchParams.get('orderId');

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery();

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useAddressesQuery();

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useProductsQuery();

  const {
    data: existingOrderData,
    isLoading: existingOrderLoading,
  } = useOrderByIdQuery(orderIdParam);

  const userEmail = profile?.email || '';
  const addresses = addressesData ?? EMPTY_ARRAY;
  const productsDataSafe = productsData ?? EMPTY_ARRAY;

  const products = useMemo(() => {
    const map = {};
    productsDataSafe.forEach((product) => {
      map[product.id] = product;
    });
    return map;
  }, [productsDataSafe]);

  const existingOrder =
    existingOrderData && existingOrderData.status === 'PENDING_PAYMENT'
      ? existingOrderData
      : null;

  const loading =
    profileLoading ||
    addressesLoading ||
    productsLoading ||
    (orderIdParam && existingOrderLoading);

  useEffect(() => {
    const authError = profileError || addressesError;
    if (authError && (authError.message?.includes('401') || authError.message?.includes('Unauthorized'))) {
      router.push('/login');
    }
  }, [profileError, addressesError, router]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length === 1) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (existingOrder && existingOrder.shippingAddress?.id) {
      setSelectedAddressId(existingOrder.shippingAddress.id);
    }
  }, [existingOrder]);

  const calculateShippingCourier = () => {
    // Envío por courier: el cliente paga el envío al recibir el paquete
    // En nuestra orden solo registramos 0 como costo de envío.
    return 0;
  };

  const calculateShippingLocal = () => {
    // Entregas locales y zonas cercanas: precio fijo 10 soles
    return 10;
  };

  const calculateShippingPickup = () => {
    // Recojo en tienda: sin costo de envío
    return 0;
  };

  const calculateShipping = () => {
    if (deliveryMethod === 'local') {
      return calculateShippingLocal();
    }
    if (deliveryMethod === 'pickup') {
      return calculateShippingPickup();
    }
    return calculateShippingCourier();
  };

  const calculateTotal = () => {
    return getTotalPrice() + calculateShipping();
  };

  const handlePay = async () => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!selectedAddressId) {
      alert('Por favor selecciona una dirección de envío');
      return;
    }

    try {
      setProcessing(true);

      let order;
      if (existingOrder) {
        order = existingOrder;
      } else {
        const orderData = {
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddressId,
        };
        order = await orderAPI.create(orderData);
      }

      const shippingCost = calculateShipping();
      const preferenceResponse = await orderAPI.createPaymentPreference(order.id, shippingCost);

      clearCart();
      window.location.href = preferenceResponse.initPoint;

    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert(`Error al procesar el pago: ${error.message}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <button
            onClick={() => router.push('/productos')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingCourier = calculateShippingCourier();
  const shippingLocal = calculateShippingLocal();
  const shippingPickup = calculateShippingPickup();
  const shipping = calculateShipping();
  const total = calculateTotal();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full flex justify-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-400">
              Completa tu información para finalizar tu compra
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <OrderSummaryCard
              cartItems={cartItems}
              products={products}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              onPay={handlePay}
              processing={processing}
              hasShippingAddress={Boolean(selectedAddressId)}
            />

            <div className="space-y-6">
              <ContactInfoCard userEmail={userEmail} />
              <ShippingAddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onManageAddresses={() => router.push('/perfil')}
              />
              <DeliveryMethodSelector
                deliveryMethod={deliveryMethod}
                onChangeDeliveryMethod={setDeliveryMethod}
                shippingCourier={shippingCourier}
                shippingLocal={shippingLocal}
                shippingPickup={shippingPickup}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrderSummaryCard({
  cartItems,
  products,
  subtotal,
  shipping,
  total,
  onPay,
  processing,
  hasShippingAddress,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Resumen de la orden</h2>

        <div className="space-y-4 mb-6">
          {cartItems.map((item, index) => (
            <div
              key={item.productId}
              className={`flex gap-4 ${index < cartItems.length - 1 ? 'pb-4 border-b border-white/5' : ''}`}
            >
              <div className="w-20 h-20 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/5 overflow-hidden">
                {products[item.productId]?.imageUrl ? (
                  <img
                    src={ensureHttps(products[item.productId].imageUrl)}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{item.productName}</h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                  {products[item.productId]?.description || 'Premium Product'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Shipping</span>
            <span className="font-semibold text-white">{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10 mt-4">
            <span>Total</span>
            <span className="text-purple-400">{formatPrice(total)}</span>
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={processing || !hasShippingAddress}
          className="w-full mt-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}

function ContactInfoCard({ userEmail }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-4">Información de contacto</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">Email</label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/50 text-gray-500 cursor-not-allowed focus:outline-none"
        />
      </div>
    </div>
  );
}

function ShippingAddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onManageAddresses,
}) {
  const hasAddresses = addresses.length > 0;

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Dirección de envío</h2>
        <button
          onClick={onManageAddresses}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Manage
        </button>
      </div>

      {!hasAddresses ? (
        <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
          <p className="text-gray-500 mb-4">No addresses found</p>
          <button
            onClick={onManageAddresses}
            className="px-4 py-2 text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Agregar dirección
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${selectedAddressId === address.id
                ? 'border-purple-500 bg-purple-900/10'
                : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={(e) => onSelectAddress(e.target.value)}
                className="mt-1 accent-purple-500"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{address.street}</p>
                <p className="text-sm text-gray-400">
                  {address.district}, {address.province}, {address.department}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryMethodSelector({
  deliveryMethod,
  onChangeDeliveryMethod,
  shippingCourier,
  shippingLocal,
  shippingPickup,
}) {
  const [openInfo, setOpenInfo] = useState(null);

  const toggleInfo = (method) => {
    setOpenInfo((current) => (current === method ? null : method));
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-4">Método de envío</h2>
      <div className="space-y-3">
        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${deliveryMethod === 'courier'
            ? 'border-purple-500 bg-purple-900/10'
            : 'border-white/10 bg-black/30 hover:border-white/20'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="courier"
              checked={deliveryMethod === 'courier'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 accent-purple-500"
            />
            <p className="font-medium text-white flex-1">Envío por courier (pago contra entrega)</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleInfo('courier');
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-gray-300 hover:bg-white/10"
              aria-label="Ver detalles del envío por courier"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </button>
          </div>
          {openInfo === 'courier' && (
            <p className="text-xs text-gray-400 leading-relaxed pl-7">
              Recibe tu pedido en cualquier ciudad del país. El costo del envío lo pagas al recibir tu paquete.
            </p>
          )}
        </label>

        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${deliveryMethod === 'local'
            ? 'border-purple-500 bg-purple-900/10'
            : 'border-white/10 bg-black/30 hover:border-white/20'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="local"
              checked={deliveryMethod === 'local'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 accent-purple-500"
            />
            <p className="font-medium text-white flex-1">Entregas locales y zonas cercanas</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleInfo('local');
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-gray-300 hover:bg-white/10"
              aria-label="Ver detalles de entregas locales"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </button>
          </div>
          {openInfo === 'local' && (
            <p className="text-xs text-gray-400 leading-relaxed pl-7">
              Precio fijo dentro de la ciudad de Lima.
            </p>
          )}
        </label>

        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${deliveryMethod === 'pickup'
            ? 'border-purple-500 bg-purple-900/10'
            : 'border-white/10 bg-black/30 hover:border-white/20'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 accent-purple-500"
            />
            <p className="font-medium text-white flex-1">Recojo en tienda</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleInfo('pickup');
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-gray-300 hover:bg-white/10"
              aria-label="Ver detalles de recojo en tienda"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </button>
          </div>
          {openInfo === 'pickup' && (
            <p className="text-xs text-gray-400 leading-relaxed pl-7">
              Pasa por nuestra tienda y recoge tu pedido sin costo adicional.
            </p>
          )}
        </label>
      </div>
    </div>
  );
}

export default CheckoutPage;

