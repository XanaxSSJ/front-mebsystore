"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useSearchStore } from '@/store/search.store';
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery';
import { useAuthStatusQuery } from '@/features/auth/hooks/useAuthStatusQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import CartDropdown from '@/features/cart/components/CartDropdown';
import ProfileDropdown from '@/features/user/components/ProfileDropdown';

function Navbar() {
    const searchQuery = useSearchStore((state) => state.searchQuery);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const totalItems = useCartStore(
        (state) =>
            state.cartItems.reduce(
                (total, item) => total + item.quantity,
                0,
            ),
    );
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen]);

    const {
        data: authStatus,
    } = useAuthStatusQuery();

    const {
        data: profile,
    } = useProfileQuery();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (authStatus !== undefined) {
            setIsAuthenticated(Boolean(authStatus));
            setIsCheckingAuth(false);
        }
    }, [authStatus]);

    useEffect(() => {
        if (profile && authStatus) {
            setUserEmail(profile.email || null);
        } else if (!authStatus) {
            setUserEmail(null);
        }
    }, [profile, authStatus]);

    const { data: categoriesData } = useCategoriesQuery();
    const categories = (categoriesData ?? []).slice(0, 5);

    return (
        <nav
            className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${scrolled
                ? 'bg-black/80 backdrop-blur-md border-white/10 shadow-lg'
                : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center group"
                        onClick={() => {
                            setSearchQuery('');
                            setIsSearchOpen(false);
                        }}
                    >
                        <span
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 group-hover:to-white transition-all duration-300"
                            style={{
                                fontFamily: 'var(--font-family-display)',
                                letterSpacing: '0.05em',
                                textShadow: '0 0 20px rgba(75, 0, 130, 0.3)'
                            }}
                        >
                            Mebsy Store
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center gap-8">
                        {categories.length > 0 && categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categoria/${category.slug}`}
                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group py-2"
                            >
                                {category.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Icons & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div
                            ref={searchRef}
                            className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full md:w-64 bg-white/10 rounded-full' : 'w-auto'}`}
                        >
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 ${isSearchOpen ? 'bg-transparent hover:bg-transparent' : ''}`}
                                aria-label="Buscar productos"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'w-full opacity-100 pr-3' : 'w-0 opacity-0'}`}>
                                <form onSubmit={handleSearchSubmit} className="flex w-full">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:border-none focus:ring-0 text-sm py-1"
                                    />
                                </form>
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                            aria-label="Carrito de compras"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Auth/Profile */}
                        {isCheckingAuth ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                        ) : isAuthenticated ? (
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 border border-transparent hover:border-white/10"
                                aria-label="Perfil de usuario"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <Link
                                    href="/login"
                                    className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white hover:text-purple-200 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden md:flex items-center px-5 py-2 text-sm font-medium text-white bg-purple-700 hover:bg-purple-600 rounded-full shadow-lg shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </Link>
                                {/* Mobile Auth Icon */}
                                <Link href="/login" className="md:hidden p-2 text-gray-300 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {categories.length > 0 && categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categoria/${category.slug}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    {category.name}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="px-4 py-3 text-center text-sm font-medium text-white bg-white/5 rounded-xl border border-white/10"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="px-4 py-3 text-center text-sm font-medium text-white bg-purple-700 rounded-xl"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {isAuthenticated && (
                <ProfileDropdown
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    userEmail={userEmail}
                />
            )}
        </nav>
    );
}

export default Navbar;
