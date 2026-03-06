"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { useCartStore } from '@/store/cart.store';
import ProductCard from '../components/ProductCard';
import { ensureHttps } from '@/lib/url';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { useProductAttributesQuery } from '../hooks/useProductAttributesQuery';
import { formatPrice } from '@/lib/format';

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

  // Initialize default variant (attributes are now array of { name, value, attributeValueId })
  useEffect(() => {
    if (product && product.variants?.length > 0 && attributesData?.attributes) {
      const firstVariant = product.variants[0];
      const variantAttrs = Array.isArray(firstVariant.attributes) ? firstVariant.attributes : [];
      const initialSelections = {};
      attributesData.attributes.forEach(attr => {
        const selectedVal = attr.values.find(v =>
          variantAttrs.some(a => String(a.attributeValueId) === String(v.id))
        );
        if (selectedVal) {
          initialSelections[attr.id] = selectedVal.id;
        }
      });
      setSelectedAttributes(initialSelections);
    }
  }, [product, attributesData]);

  const activeVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    const selectedIds = Object.values(selectedAttributes).filter(Boolean);
    if (selectedIds.length === 0) return product.variants[0] ?? null;
    return product.variants.find(v => {
      const variantIds = Array.isArray(v.attributes) ? v.attributes.map(a => a.attributeValueId) : [];
      return selectedIds.every(valId => variantIds.some(id => String(id) === String(valId)))
        && variantIds.length === selectedIds.length;
    }) || null;
  }, [product, selectedAttributes]);

  const displayPrice = activeVariant ? (activeVariant.price ?? product?.basePrice) : (product?.basePrice ?? product?.price);
  const displayStock = activeVariant ? activeVariant.stock : (product?.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? product?.stock ?? 0);

  const displayImage = useMemo(() => {
    let imgUrl = activeVariant
      ? product?.images?.find(img => img.variantId === activeVariant.id)?.imageUrl
      : null;

    if (!imgUrl) {
      imgUrl = product?.imageUrl; // mapped from images[0] in api
    }
    return imgUrl ? ensureHttps(imgUrl) : null;
  }, [activeVariant, product]);

  const stockLabel = useMemo(() => {
    if (!product) return '';
    if (displayStock <= 0) return 'Sold Out';
    if (displayStock === 1) return 'Only 1 unit left';
    return `${displayStock} units available`;
  }, [displayStock, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product || displayStock <= 0) return;

    const cartProduct = {
      id: activeVariant ? activeVariant.id : product.id,
      name: activeVariant ? `${product.name} - ${activeVariant.sku}` : product.name,
      price: displayPrice,
      imageUrl: displayImage,
      stock: displayStock
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background-light flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product && !loading && !error) {
    return (
      <div className="min-h-screen flex flex-col bg-background-light text-surface">
        <Navbar />
        <main className="flex-1 w-full pt-24 pb-20">
          <div className="container px-4 text-center py-20 max-w-7xl mx-auto border border-surface/10 rounded-3xl bg-white mt-10">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h1>
            <p className="text-surface/60 mb-8">The product you are looking for does not exist or has been removed.</p>
            <Link href="/productos" className="font-bold text-primary underline">View Products</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background-light text-surface">
        <Navbar />
        <main className="flex-1 w-full pt-24 pb-20">
          <div className="container px-4 text-center py-20 max-w-7xl mx-auto border border-surface/10 rounded-3xl bg-white mt-10">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error loading product</h1>
            <p className="text-surface/60 mb-8">{error}</p>
            <Link href="/" className="font-bold text-primary underline">Return Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine additional images based on all product photos
  const additionalImages = product?.images?.map(img => ensureHttps(img.imageUrl)) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background-light text-surface font-display antialiased">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12">
        {/* Breadcrumb Navbar */}
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

        {/* Product Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-white shadow-lg relative max-h-[600px] lg:max-h-[700px] flex items-center justify-center">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="h-full w-auto object-contain transition-transform hover:scale-105 duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface/10">
                  <span className="material-symbols-outlined text-6xl">inventory_2</span>
                </div>
              )}

              {/* Sold out overlay */}
              {displayStock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl font-bold tracking-widest text-surface uppercase border-4 border-surface px-8 py-4 rotate-[15deg]">Sold Out</span>
                </div>
              )}
            </div>

            {/* Mini image grid */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {additionalImages.slice(0, 4).map((imgUrl, idx) => (
                  <div key={idx} className={`aspect-square rounded-lg border ${imgUrl === displayImage ? 'border-primary border-2 shadow-sm' : 'border-surface/10 hover:border-accent'} overflow-hidden cursor-pointer transition-colors bg-white`}>
                    <img src={imgUrl} alt={`${product.name} angle ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:pl-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {displayPrice > 150 && (
                  <span className="bg-accent/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Premium Collection</span>
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
                {product.description || "Experience the pinnacle of sustainable luxury. Handcrafted with premium care, offering unmatched softness and natural thermal regulation for year-round elegance."}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Dynamic attributes */}
              {attributesData?.attributes?.map(attr => (
                <div key={attr.id} className="space-y-3">
                  <div className="flex justify-between items-center max-w-sm">
                    <label className="text-sm font-bold text-surface uppercase tracking-wider">{attr.displayName}</label>
                  </div>
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {attr.values.map(val => (
                      <button
                        key={val.id}
                        onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.id]: val.id }))}
                        className={`py-3 px-4 rounded transition-colors text-sm ${selectedAttributes[attr.id] === val.id ? 'border-2 border-primary bg-primary/5 font-bold text-primary' : 'border border-surface/20 hover:border-primary font-medium text-surface'}`}
                      >
                        {val.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* ATC */}
              <div className="flex flex-col sm:flex-row gap-4 items-end pt-2">
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <label className="text-sm font-bold text-surface uppercase tracking-wider">Quantity</label>
                  <div className="flex items-center border border-surface/20 rounded-lg h-14 px-2 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:text-primary transition-colors disabled:opacity-50 text-surface"
                      disabled={displayStock <= 0}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-surface">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
                      className="p-2 hover:text-primary transition-colors disabled:opacity-50 text-surface"
                      disabled={displayStock <= 0}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={displayStock <= 0}
                  className={`flex-grow font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] ${displayStock > 0
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                    : 'bg-surface/10 text-surface/50 cursor-not-allowed shadow-none hover:scale-100'
                    }`}
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {displayStock > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>

              {/* Stock Label */}
              <p className={`text-sm font-semibold ${displayStock > 0 ? (displayStock <= 5 ? 'text-amber-500' : 'text-green-600') : 'text-red-500'}`}>
                {stockLabel}
              </p>
            </div>

            {/* Info Tabs */}
            <div className="border-t border-surface/10 pt-4 mt-6 space-y-2">
              <details className="group" open>
                <summary className="py-4 border-b border-surface/5 flex justify-between items-center cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <span className="font-bold text-surface">Shipping & Returns</span>
                  </div>
                  <span className="material-symbols-outlined text-surface/40 group-open:-rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="py-4 text-surface/70 text-sm leading-relaxed">
                  Complimentary carbon-neutral standard shipping on all orders. Returns are accepted within 30 days of receipt. Items must be in original condition with tags attached.
                </div>
              </details>

              <details className="group">
                <summary className="py-4 border-b border-surface/5 flex justify-between items-center cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <span className="font-bold text-surface">2-Year Warranty</span>
                  </div>
                  <span className="material-symbols-outlined text-surface/40 group-open:-rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="py-4 text-surface/70 text-sm leading-relaxed">
                  Our products are guaranteed to be free of defects in materials and workmanship for two years from the original purchase date.
                </div>
              </details>

              <div className="py-4 border-b border-surface/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <span className="font-bold text-surface">Availability</span>
                </div>
                <span className={`text-sm font-bold ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {displayStock > 0 ? 'Ready to Ship' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 mb-10">
            <div className="flex justify-between items-end mb-8 border-b border-accent/20 pb-4">
              <div>
                <h3 className="text-3xl font-extrabold text-surface">Complete the Look</h3>
                <p className="text-surface/60 mt-1 font-medium">Recommended for you based on this category</p>
              </div>
              <Link href="/productos" className="hidden md:flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all">
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Link href="/productos" className="md:hidden mt-8 flex items-center justify-center gap-1 text-primary font-bold">
              View All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;
