"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageLayout from '@/shared/components/PageLayout';
import { useCartStore } from '@/store/cart.store';
import { ensureHttps } from '@/lib/url';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { useProductAttributesQuery } from '../hooks/useProductAttributesQuery';
import { formatPrice } from '@/lib/format';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductAttributes from '../components/ProductAttributes';
import AddToCartSection from '../components/AddToCartSection';
import ProductInfoTabs from '../components/ProductInfoTabs';
import RelatedProducts from '../components/RelatedProducts';

const MAX_RELATED_PRODUCTS = 4;

function ProductDetailPage() {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsQuery();

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery();

  const {
    data: attributesData,
    isLoading: attributesLoading,
  } = useProductAttributesQuery(id);

  const loading = productsLoading || categoriesLoading || attributesLoading;
  const error = productsError || categoriesError;

  const product = useMemo(() => {
    if (!productsData) return null;
    return productsData.find((p) => String(p.id) === String(id)) ?? null;
  }, [productsData, id]);

  const category = useMemo(() => {
    if (!categoriesData || !product) return null;
    return categoriesData.find((c) => String(c.id) === String(product.categoryId)) ?? null;
  }, [categoriesData, product]);

  const categoryName = category?.name ?? '';
  const categorySlug = category?.slug ?? '';

  const relatedProducts = useMemo(() => {
    if (!productsData || !product) return [];
    const sameCategory = productsData
      .filter((p) => String(p.id) !== String(product.id))
      .filter((p) => String(p.categoryId) === String(product.categoryId));

    const shuffled = [...sameCategory].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, MAX_RELATED_PRODUCTS);
  }, [productsData, product]);

  const activeVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    const selectedIds = Object.values(selectedAttributes).filter(Boolean);
    const totalRequiredAttributes = attributesData?.attributes?.length || 0;
    
    if (totalRequiredAttributes > 0 && selectedIds.length !== totalRequiredAttributes) {
      return null;
    }

    return product.variants.find(v => {
      const variantIds = Array.isArray(v.attributes) ? v.attributes.map(a => a.attributeValueId) : [];
      return selectedIds.every(valId => variantIds.some(vid => String(vid) === String(valId)))
        && variantIds.length === selectedIds.length;
    }) || null;
  }, [product, selectedAttributes, attributesData]);

  const displayPrice = activeVariant ? (activeVariant.price ?? product?.basePrice) : (product?.basePrice ?? product?.price);
  const displayStock = activeVariant ? activeVariant.stock : (product?.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? product?.stock ?? 0);

  const displayImage = useMemo(() => {
    let imgUrl = activeVariant
      ? product?.images?.find(img => img.variantId === activeVariant.id)?.imageUrl
      : null;

    if (!imgUrl) {
      imgUrl = product?.imageUrl;
    }
    return imgUrl ? ensureHttps(imgUrl) : null;
  }, [activeVariant, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product || displayStock <= 0) return;
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants && !activeVariant) return;

    const cartItem = {
      variantId: activeVariant ? activeVariant.id : product.id,
      productId: product.id,
      productName: product.name,
      attributes: activeVariant && Array.isArray(activeVariant.attributes)
        ? activeVariant.attributes.map(a => ({ name: a.name, value: a.value }))
        : [],
      price: displayPrice,
      imageUrl: displayImage,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
  };

  const handleSelectAttribute = (attrId, valId) => {
    setSelectedAttributes(prev => ({ ...prev, [attrId]: valId }));
  };

  if (loading) return (
    <PageLayout className="flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </PageLayout>
  );

  if (!product && !loading && !error) {
    return (
      <PageLayout className="w-full pt-24 pb-20">
          <div className="container px-4 text-center py-20 max-w-7xl mx-auto border border-surface/10 rounded-3xl bg-white mt-10">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Producto no encontrado</h1>
            <p className="text-surface/60 mb-8">El producto que buscas no existe o ha sido eliminado.</p>
            <Link href="/productos" className="font-bold text-primary underline">Ver productos</Link>
          </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout className="w-full pt-24 pb-20">
          <div className="container px-4 text-center py-20 max-w-7xl mx-auto border border-surface/10 rounded-3xl bg-white mt-10">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error al cargar producto</h1>
            <p className="text-surface/60 mb-8">{error}</p>
            <Link href="/" className="font-bold text-primary underline">Volver al inicio</Link>
          </div>
      </PageLayout>
    );
  }

  const additionalImages = product?.images?.map(img => ensureHttps(img.imageUrl)) || [];

  return (
    <PageLayout className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-surface/40 mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/productos" className="hover:text-primary transition-colors">Colecciones</Link>
          {categoryName && categorySlug && (
            <>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <Link href={`/categoria/${categorySlug}`} className="hover:text-primary transition-colors">{categoryName}</Link>
            </>
          )}
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-surface">{product?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <ProductImageGallery
            displayImage={displayImage}
            productName={product.name}
            additionalImages={additionalImages}
            displayStock={displayStock}
          />

          <div className="lg:col-span-5 flex flex-col gap-8 lg:pl-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {displayPrice > 150 && (
                  <span className="bg-accent/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Colección Premium</span>
                )}
                <div className="flex items-center text-amber-500">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="ml-1 text-surface/60 text-xs font-medium">(48 reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-surface leading-tight tracking-tight">
                {product.name}
              </h1>

              <p className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</p>

              <p className="text-surface/70 leading-relaxed max-w-md text-lg">
                {product.description || "Experimenta lo máximo en lujo sostenible. Elaborado artesanalmente con cuidado premium, ofreciendo una suavidad inigualable y regulación térmica natural para una elegancia durante todo el año."}
              </p>
            </div>

            <div className="space-y-6">
              <ProductAttributes
                attributes={attributesData?.attributes}
                selectedAttributes={selectedAttributes}
                onSelectAttribute={handleSelectAttribute}
              />

              <AddToCartSection
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToCart={handleAddToCart}
                displayStock={displayStock}
                displayPrice={displayPrice}
                isSelectionIncomplete={attributesData?.attributes?.length > 0 && Object.values(selectedAttributes).filter(Boolean).length !== attributesData.attributes.length}
              />
            </div>

            <ProductInfoTabs displayStock={displayStock} />
          </div>
        </div>

        <RelatedProducts products={relatedProducts} />
    </PageLayout>
  );
}

export default ProductDetailPage;
