"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/features/auth/api/auth.api';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

function ProfileDropdown({ isOpen, onClose, userEmail }) {
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  useClickOutside(dropdownRef, onClose, isOpen);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authAPI.logout();
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

  const handleNav = (path) => {
    onClose();
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 top-full pt-2 w-56 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl border border-surface/5 overflow-hidden">
        <div className="p-4 border-b border-surface/5">
          <p className="text-[10px] font-bold text-surface/40 uppercase tracking-widest mb-1">
            Conectado como
          </p>
          <p className="text-xs font-bold text-surface truncate">{userEmail || '—'}</p>
        </div>
        <div className="py-2">
          <button
            type="button"
            onClick={() => handleNav('/perfil')}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-surface hover:bg-background-light transition-colors text-left"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
            Mi perfil
          </button>
          <button
            type="button"
            onClick={() => handleNav('/ordenes')}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-surface hover:bg-background-light transition-colors text-left"
          >
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            Mis órdenes
          </button>
        </div>
        <div className="p-2 border-t border-surface/5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50 text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDropdown;
