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

function Navbar() {
    const searchQuery = useSearchStore((state) => state.searchQuery);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const totalItems = useCartStore((state) => state.cartItems.reduce((total, item) => total + item.quantity, 0));
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
        }
    };

    useClickOutside(searchRef, () => setIsSearchOpen(false), isSearchOpen);

    useEffect(() => {
        if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isSearchOpen]);

    const { data: authStatus } = useAuthStatusQuery();
    const { data: profile } = useProfileQuery();

    useEffect(() => {
        if (authStatus !== undefined) {
            setIsAuthenticated(Boolean(authStatus));
            setIsCheckingAuth(false);
        }
    }, [authStatus]);

    useEffect(() => {
        if (profile && authStatus) setUserEmail(profile.email || null);
        else if (!authStatus) setUserEmail(null);
    }, [profile, authStatus]);

    return (
        <nav className="sticky top-0 z-50 glass-nav border-b border-surface/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex flex-wrap items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-2"
                >
                    <div className="bg-primary p-1.5 rounded-lg text-white">
                        <span className="material-symbols-outlined text-2xl">diamond</span>
                    </div>
                    <span className="text-2xl font-extrabold tracking-tighter text-surface uppercase">Mebsy Store</span>
                </Link>

                {/* Navigation Links: Tienda (all products), Colecciones (categories), Sobre Nosotros */}
                <div className="hidden md:flex items-center gap-10">
                    <Link
                        href="/productos"
                        className="text-sm font-semibold hover:text-primary transition-colors text-surface"
                    >
                        Tienda
                    </Link>
                    <Link
                        href="/colecciones"
                        className="text-sm font-semibold hover:text-primary transition-colors text-surface"
                    >
                        Colecciones
                    </Link>
                    <Link
                        href="/sobre-nosotros"
                        className="text-sm font-semibold hover:text-primary transition-colors text-surface"
                    >
                        Sobre Nosotros
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div ref={searchRef} className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 bg-white/50 rounded-full' : 'w-auto'}`}>
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-white/50 rounded-full transition-all flex items-center">
                            <span className="material-symbols-outlined text-surface">search</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSearchOpen ? 'w-full opacity-100 pr-3' : 'w-0 opacity-0'}`}>
                            <form onSubmit={handleSearchSubmit} className="flex flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full bg-transparent border-none text-surface focus:outline-none focus:ring-0 text-sm py-1"
                                />
                            </form>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="relative">
                        <button onClick={() => setIsCartOpen(!isCartOpen)} className="p-2 hover:bg-white/50 rounded-full transition-all relative flex items-center">
                            <span className="material-symbols-outlined text-surface">shopping_bag</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                        <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                    </div>

                    <div className="h-6 w-[1px] bg-surface/10 mx-2 hidden md:block"></div>

                    {/* Auth */}
                    {isCheckingAuth ? (
                        <div className="w-8 h-8 rounded-full bg-surface/10 animate-pulse hidden md:block"></div>
                    ) : isAuthenticated ? (
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-2 hover:bg-white/50 rounded-full transition-all border border-transparent flex items-center">
                                <span className="material-symbols-outlined text-surface">person</span>
                            </button>
                            <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} userEmail={userEmail} />
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:flex items-center gap-2 bg-surface text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-surface/90 transition-all">
                            <span className="material-symbols-outlined text-sm">person</span>
                            Ingresar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
