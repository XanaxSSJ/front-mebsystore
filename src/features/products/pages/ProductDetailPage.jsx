import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { useCartStore } from '@/store/cart.store';
import ProductCard from '../components/ProductCard';
import { ensureHttps } from '@/lib/url';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { formatPrice } from '@/lib/format';

const MAX_RELATED_PRODUCTS = 4;

function ProductDetailPage() {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

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

  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  const product = useMemo(() => {
    if (!productsData) return null;
    return (
      productsData.find((p) => String(p.id) === String(id)) ?? null
    );
  }, [productsData, id]);

  const categoryName = useMemo(() => {
    if (!categoriesData || !product) return '';
    const found = categoriesData.find(
      (c) => String(c.id) === String(product.categoryId),
    );
    return found?.name || '';
  }, [categoriesData, product]);

  const relatedProducts = useMemo(() => {
    if (!productsData || !product) return [];

    const sameCategory = productsData
      .filter((p) => String(p.id) !== String(product.id))
      .filter((p) => String(p.categoryId) === String(product.categoryId));

    const shuffled = [...sameCategory];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, MAX_RELATED_PRODUCTS);
  }, [productsData, product]);

  const stockLabel = useMemo(() => {
    if (!product) return '';
    if (product.stock <= 0) return 'Sin stock';
    if (product.stock === 1) return '1 unidad disponible';
    return `${product.stock} unidades disponibles`;
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product && !loading && !error) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-1 w-full pt-24 pb-20">
          <div className="container px-4 text-center py-20">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Producto no encontrado</h1>
            <p className="text-gray-400 mb-8">El producto que buscas no existe o fue eliminado.</p>
            <Link href="/productos" className="text-purple-400 hover:text-purple-300 underline">Ver productos</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-20">
        {error ? (
          <div className="container px-4 text-center py-20">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error loading product</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Link href="/" className="text-purple-400 hover:text-purple-300 underline">Regresar a Inicio</Link>
          </div>
        ) : !product ? null : (
          <div className="container px-4 mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-fade-in">
              <Link href="/" className="hover:text-purple-400 transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/productos" className="hover:text-purple-400 transition-colors">Productos</Link>
              <span>/</span>
              <span className="text-white font-medium">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Product Image */}
              <div className="lg:sticky lg:top-24 animate-fade-in">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-2xl shadow-purple-900/10 group">
                  {product.imageUrl ? (
                    <img
                      src={ensureHttps(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-3xl font-bold text-white uppercase tracking-widest border-4 border-white px-8 py-4 rotate-12">Sold Out</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="mb-6">
                  {categoryName && (
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                      {categoryName}
                    </span>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-purple-400">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock > 0 && (
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none mb-10 text-gray-400 leading-relaxed text-lg">
                  <p>{product.description || 'No description available for this product.'}</p>
                </div>

                {/* Actions */}
                <div className="border-t border-white/10 pt-8 mb-10">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className={`flex - 1 py - 4 rounded - xl font - bold text - lg tracking - wide transition - all shadow - lg transform hover: -translate - y - 1 ${product.stock > 0
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-600 hover:to-indigo-600 shadow-purple-900/40'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        } `}
                    >
                      {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                    </button>
                    <button
                      className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                      type="button"
                      aria-label="Añadir a favoritos"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-500">
                    {stockLabel}
                  </p>
                </div>

                {/* Features / Details (Placeholder features) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-white font-semibold mb-1">Entrega Rápida </h3>
                    <p className="text-sm text-gray-500">2-3 días hábiles</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-white font-semibold mb-1">Garantía</h3>
                    <p className="text-sm text-gray-500">6 meses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-32 pt-16 border-t border-white/10">
                <h2 className="text-3xl font-bold text-white mb-10">También te puede gustar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;

