import { useMemo } from 'react';
import { useProductAttributesQuery } from '@/features/products/hooks/useProductAttributesQuery';
import { useCartStore } from '@/store/cart.store';
import { ensureHttps } from '@/lib/url';
import { formatPrice } from '@/lib/format';

export default function OrderProductItem({ item, product, onViewProduct, showReorder = true, showSubtotal = false }) {
  const { data: attributesData } = useProductAttributesQuery(item.productId);
  const addToCart = useCartStore((state) => state.addToCart);

  const variant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => String(v.id) === String(item.variantId));
  }, [product, item.variantId]);

  const { description, cartAttributes } = useMemo(() => {
    if (!variant || !variant.attributes || !attributesData?.attributes) {
      return { description: null, cartAttributes: [] };
    }

    const isArray = Array.isArray(variant.attributes);
    const attrValues = [];
    const mappedCartAttrs = [];

    attributesData.attributes.forEach(attrdef => {
      let matchedVal = null;
      if (isArray) {
        const match = variant.attributes.find(a =>
          attrdef.values.some(v => String(v.id) === String(a.attributeValueId))
        );
        if (match) {
          matchedVal = attrdef.values.find(v => String(v.id) === String(match.attributeValueId));
        }
      } else {
        const keys = Object.keys(variant.attributes);
        matchedVal = attrdef.values.find(v => keys.includes(String(v.id)));
      }

      if (matchedVal) {
        attrValues.push(`${attrdef.name}: ${matchedVal.value}`);
        mappedCartAttrs.push({ name: attrdef.name, value: matchedVal.value });
      }
    });

    return {
      description: attrValues.length > 0 ? attrValues.join(' / ') : null,
      cartAttributes: mappedCartAttrs
    };
  }, [variant, attributesData]);

  const displayImage = useMemo(() => {
    const variantImg = product?.images?.find(img => img.variantId === item.variantId)?.imageUrl;
    const finalImg = variantImg || product?.imageUrl;
    return finalImg ? ensureHttps(finalImg) : null;
  }, [product, item.variantId]);

  const displayTitle = product?.name || item.productName;
  const displayDesc = description || product?.description || 'Producto de calidad premium';

  const handleBuyAgain = () => {
    if (!product || !variant) return;

    const cartItem = {
      variantId: item.variantId,
      productId: item.productId,
      productName: displayTitle,
      attributes: cartAttributes,
      price: variant.price || product.basePrice,
      imageUrl: displayImage,
    };

    for (let i = 0; i < item.quantity; i++) {
      addToCart(cartItem);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 border-b border-surface/5 last:border-0 last:pb-0">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-background-light rounded-xl flex items-center justify-center flex-shrink-0 border border-surface/10 overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-4xl text-surface/40">image</span>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-surface mb-1 text-base sm:text-lg break-words">
              {displayTitle}
            </h4>
            <p className="text-sm text-surface/60 mb-2 leading-relaxed line-clamp-2">
              {displayDesc}
            </p>
            <p className="text-sm text-surface/40">Cantidad: {item.quantity}</p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-lg font-semibold text-surface">
              {formatPrice(item.unitPrice)}
            </p>
            {item.quantity > 1 && showSubtotal && item.subtotal && (
              <p className="text-sm text-surface/40 mt-1">
                Subtotal: {formatPrice(item.subtotal)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          {showReorder && (
            <button
              onClick={handleBuyAgain}
              className="text-sm font-medium text-surface/60 hover:text-surface transition-colors"
              disabled={!attributesData || !variant}
            >
              Comprar de nuevo
            </button>
          )}
          {showReorder && onViewProduct && <span className="text-surface/40">|</span>}
          {onViewProduct && (
            <button
              onClick={() => onViewProduct(item.productId)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ver producto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
