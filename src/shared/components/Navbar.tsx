"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useSearchStore } from '@/store/search.store';
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import CartDropdown from '@/features/cart/components/CartDropdown';
import ProfileDropdown from '@/features/user/components/ProfileDropdown';

const NAV_LINKS = [
  { href: '/productos', label: 'Tienda' },
  { href: '/colecciones', label: 'Colecciones' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
];

/** Misma caja táctil para todos los iconos del header en móvil */
const NAV_ICON_BTN =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/50 transition-colors';

function Navbar() {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.cartItems.reduce((total, item) => total + item.quantity, 0));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useClickOutside(searchRef, () => setIsSearchOpen(false), isSearchOpen);
  useClickOutside(navRef, () => setIsMobileMenuOpen(false), isMobileMenuOpen);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const { data: authStatus, isPending: isCheckingAuth } = useAuthStatusQuery();
  const isAuthenticated = Boolean(authStatus);
  const { data: profile } = useProfileQuery();
  const userEmail = profile?.email ?? null;

  return (
    <nav ref={navRef} className="sticky top-0 z-50 glass-nav border-b border-surface/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 min-w-0">
          <Link
            href="/"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
              closeMobileMenu();
            }}
            className="flex items-center gap-2 min-w-0 shrink"
          >
            <div className="bg-primary p-1.5 rounded-lg text-white shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">diamond</span>
            </div>
            <span className="text-lg sm:text-2xl font-extrabold tracking-tighter text-surface uppercase truncate">
              Mebsy Store
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold hover:text-primary transition-colors text-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <div ref={searchRef} className="relative hidden sm:block">
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-40 md:w-48 bg-white/50 rounded-full' : 'w-auto'}`}>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={NAV_ICON_BTN}
                  aria-label="Buscar"
                >
                  <span className="material-symbols-outlined text-surface">search</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSearchOpen ? 'w-full opacity-100 pr-3' : 'w-0 opacity-0'}`}>
                  <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-0">
                    <input
                      ref={inputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full min-w-0 bg-transparent border-none text-surface focus:outline-none focus:ring-0 text-sm py-1"
                    />
                  </form>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                closeMobileMenu();
              }}
              className={`${NAV_ICON_BTN} sm:hidden`}
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined text-surface">search</span>
            </button>

            <div className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(!isCartOpen);
                  closeMobileMenu();
                }}
                className={NAV_ICON_BTN}
                aria-label="Carrito"
              >
                <span className="material-symbols-outlined text-surface">shopping_bag</span>
                {totalItems > 0 && (
                  <span className="pointer-events-none absolute top-1 right-1 bg-primary text-[10px] text-white min-w-4 h-4 px-0.5 flex items-center justify-center rounded-full font-bold leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
              <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>

            <div className="h-6 w-px bg-surface/10 mx-1 hidden md:block" />

            <div className="hidden md:flex min-w-[152px] items-center justify-end">
              {isCheckingAuth ? (
                <div className="h-9 w-[152px] rounded-lg bg-surface/10 animate-pulse" aria-hidden />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center rounded-full border border-transparent p-2 transition-all hover:bg-white/50"
                    aria-label="Mi cuenta"
                  >
                    <span className="material-symbols-outlined text-surface">person</span>
                  </button>
                  <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} userEmail={userEmail} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg bg-surface px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-surface/90"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Ingresar
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${NAV_ICON_BTN} md:hidden`}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="material-symbols-outlined text-surface">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="sm:hidden border-t border-surface/10 py-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 min-w-0 rounded-lg border border-surface/10 bg-white px-4 py-2.5 text-sm text-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-surface/10 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-surface hover:bg-white/60 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-surface/10">
              {isCheckingAuth ? (
                <div className="h-10 rounded-lg bg-surface/10 animate-pulse" aria-hidden />
              ) : isAuthenticated ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-surface/40 truncate">
                    {userEmail || 'Mi cuenta'}
                  </p>
                  <Link
                    href="/perfil"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-surface hover:bg-white/60"
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/ordenes"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-surface hover:bg-white/60"
                  >
                    Mis órdenes
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-surface px-4 py-3 text-sm font-bold text-white"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
