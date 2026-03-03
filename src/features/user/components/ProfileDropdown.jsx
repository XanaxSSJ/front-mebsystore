"use client";

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/features/auth/api/auth.api';

function ProfileDropdown({ isOpen, onClose, userEmail }) {
    const dropdownRef = useRef(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await authAPI.logout();

            // Invalidar y resetear queries para limpiar el estado de usuario
            await queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
            await queryClient.resetQueries({ queryKey: ['user', 'profile'] });

            onClose();
            router.push('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            onClose();
            router.push('/login');
        } finally {
            setLoggingOut(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="fixed top-20 right-4 w-72 bg-black/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col z-50 animate-fade-in origin-top-right overflow-hidden"
        >
            {/* Menu Items */}
            <div className="p-2 space-y-1">
                <button
                    onClick={() => {
                        onClose();
                        router.push('/perfil');
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-3 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    Mi Perfil
                </button>

                <button
                    onClick={() => {
                        onClose();
                        router.push('/ordenes');
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-3 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    Mis Ordenes
                </button>

                <div className="border-t border-white/10 my-2 mx-2"></div>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center text-red-400 group-hover:text-red-300 group-hover:bg-red-500/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </button>
            </div>
        </div>
    );
}

export default ProfileDropdown;
