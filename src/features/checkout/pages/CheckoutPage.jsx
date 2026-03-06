import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/shared/components/PageLayout';
import { useAuthRedirect } from '@/shared/hooks/useAuthRedirect';
import { orderAPI } from '@/features/orders/api/orders.api';
import { useCartStore } from '@/store/cart.store';
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery';
import { useAddressesQuery } from '@/features/user/hooks/useAddressesQuery';
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
    data: existingOrderData,
    isLoading: existingOrderLoading,
  } = useOrderByIdQuery(orderIdParam);

  const addresses = addressesData ?? EMPTY_ARRAY;

  const existingOrder =
    existingOrderData && existingOrderData.status === 'PENDING_PAYMENT'
      ? existingOrderData
      : null;

  const loading =
    profileLoading ||
    addressesLoading ||
    (orderIdParam && existingOrderLoading);

  useAuthRedirect(profileError, addressesError);

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
            variantId: item.variantId,
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
      <PageLayout className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </PageLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <PageLayout className="flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">shopping_bag</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Tu carrito está vacío</h1>
          <p className="text-surface/60 mb-6 text-center max-w-md">
            Aún no has agregado productos a tu bolsa. Explora la tienda y encuentra algo que te encante.
          </p>
          <button
            onClick={() => router.push('/productos')}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all"
          >
            Ver productos
          </button>
      </PageLayout>
    );
  }

  const subtotal = getTotalPrice();
  const shippingCourier = calculateShippingCourier();
  const shippingLocal = calculateShippingLocal();
  const shippingPickup = calculateShippingPickup();
  const shipping = calculateShipping();
  const total = calculateTotal();

  return (
    <PageLayout className="px-6 md:px-20 lg:px-40 py-10 flex flex-col lg:flex-row gap-12 max-w-[1440px] mx-auto w-full">
        {/* Left: steps + shipping + methods */}
        <div className="flex-1 space-y-10">
          {/* Breadcrumbs / steps */}
          <nav className="flex items-center gap-2 text-sm font-medium text-surface/50 mb-2">
            <button
              type="button"
              onClick={() => router.push('/carrito')}
              className="hover:text-primary transition-colors"
            >
              Carrito
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-surface">Checkout</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-surface">Checkout</h1>

          {/* Contact + address + delivery */}
          <section className="space-y-6">
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
          </section>
        </div>

        {/* Right: order summary sticky */}
        <div className="lg:w-[400px] w-full">
          <OrderSummaryCard
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            onPay={handlePay}
            processing={processing}
            hasShippingAddress={Boolean(selectedAddressId)}
          />
        </div>
    </PageLayout>
  );
}

function OrderSummaryCard({
  cartItems,
  subtotal,
  shipping,
  total,
  onPay,
  processing,
  hasShippingAddress,
}) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-primary/5 space-y-6">
      <h2 className="text-xl font-extrabold mb-4 text-surface border-b border-primary/10 pb-4">
        Resumen de la orden
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-4">
        {cartItems.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-primary/10">
              {item.imageUrl ? (
                <img
                  src={ensureHttps(item.imageUrl)}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-surface/30">
                  <span className="material-symbols-outlined text-2xl">image</span>
                </div>
              )}
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-surface line-clamp-1">
                {item.productName}
              </p>
              {item.attributes?.length > 0 && (
                <p className="text-[10px] text-surface/50 mt-0.5">
                  {item.attributes.map(a => `${a.name}: ${a.value}`).join(' / ')}
                </p>
              )}
            </div>
            <p className="text-sm font-bold text-surface">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 border-t border-primary/10 pt-4 text-sm font-medium">
        <div className="flex justify-between text-surface/70">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-surface/70">
          <span>Envío</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-xl font-extrabold text-surface pt-3">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Payment CTA */}
      <div className="space-y-3 pt-2">
        <p className="text-[10px] text-center text-surface/50 font-medium uppercase tracking-widest">
          Checkout seguro con Mercado Pago
        </p>
        <button
          onClick={onPay}
          disabled={processing || !hasShippingAddress}
          className="w-full bg-primary hover:opacity-90 text-white rounded-xl h-14 font-extrabold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">payments</span>
          {processing ? 'Procesando...' : 'Pagar ahora'}
        </button>
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">local_shipping</span>
        <h2 className="text-xl font-bold text-surface">Dirección de envío</h2>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface/60">
            Selecciona una dirección para el envío de tu pedido.
          </p>
          <button
            type="button"
            onClick={onManageAddresses}
            className="text-xs font-bold text-primary hover:underline"
          >
            Gestionar
          </button>
        </div>

        {!hasAddresses ? (
          <div className="text-center py-6 border border-dashed border-primary/20 rounded-xl">
            <p className="text-surface/50 mb-4">No tienes direcciones registradas.</p>
            <button
              type="button"
              onClick={onManageAddresses}
              className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:opacity-90 transition-colors"
            >
              Agregar dirección
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedAddressId === address.id
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/10 bg-background-light hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={(e) => onSelectAddress(e.target.value)}
                  className="mt-1 text-primary focus:ring-primary h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-semibold text-surface">{address.street}</p>
                  <p className="text-sm text-surface/60">
                    {address.district}, {address.province}, {address.department}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">package_2</span>
        <h2 className="text-xl font-bold text-surface">Método de envío</h2>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 p-5 space-y-3">
        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${
            deliveryMethod === 'courier'
              ? 'border-primary bg-primary/5'
              : 'border-primary/10 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="courier"
              checked={deliveryMethod === 'courier'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <p className="font-semibold text-surface">
                Envío por courier (pago contra entrega)
              </p>
              <p className="text-xs text-surface/60">
                Recibe tu pedido en cualquier ciudad del país.
              </p>
            </div>
            <span className="text-sm font-bold text-surface">
              {formatPrice(shippingCourier)}
            </span>
          </div>
          {openInfo === 'courier' && (
            <p className="text-xs text-surface/60 leading-relaxed pl-7">
              El costo del envío lo pagas al recibir tu paquete. En la orden solo
              registramos 0 como costo de envío.
            </p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleInfo('courier');
            }}
            className="self-start mt-1 text-[11px] text-primary hover:underline pl-7"
          >
            {openInfo === 'courier' ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        </label>

        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${
            deliveryMethod === 'local'
              ? 'border-primary bg-primary/5'
              : 'border-primary/10 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="local"
              checked={deliveryMethod === 'local'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <p className="font-semibold text-surface">
                Entregas locales y zonas cercanas
              </p>
              <p className="text-xs text-surface/60">
                Precio fijo dentro de la ciudad de Lima.
              </p>
            </div>
            <span className="text-sm font-bold text-surface">
              {formatPrice(shippingLocal)}
            </span>
          </div>
          {openInfo === 'local' && (
            <p className="text-xs text-surface/60 leading-relaxed pl-7">
              El reparto se realiza en horarios coordinados previamente contigo.
            </p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleInfo('local');
            }}
            className="self-start mt-1 text-[11px] text-primary hover:underline pl-7"
          >
            {openInfo === 'local' ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        </label>

        <label
          className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer border transition-all ${
            deliveryMethod === 'pickup'
              ? 'border-primary bg-primary/5'
              : 'border-primary/10 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={(e) => onChangeDeliveryMethod(e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <p className="font-semibold text-surface">Recojo en tienda</p>
              <p className="text-xs text-surface/60">
                Pasa por nuestra tienda y recoge tu pedido sin costo adicional.
              </p>
            </div>
            <span className="text-sm font-bold text-surface">
              {formatPrice(shippingPickup)}
            </span>
          </div>
          {openInfo === 'pickup' && (
            <p className="text-xs text-surface/60 leading-relaxed pl-7">
              Te avisaremos cuando tu pedido esté listo para recoger.
            </p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleInfo('pickup');
            }}
            className="self-start mt-1 text-[11px] text-primary hover:underline pl-7"
          >
            {openInfo === 'pickup' ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        </label>
      </div>
    </section>
  );
}

export default CheckoutPage;

