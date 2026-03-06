import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth.api';
import PageLayout from '@/shared/components/PageLayout';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(email, password);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

      window.location.href = from;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[480px] bg-white rounded-lg shadow-xl shadow-primary/5 p-8 md:p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h1 className="text-surface text-3xl font-bold tracking-tight mb-2">Bienvenido de vuelta</h1>
            <p className="text-surface/60 text-sm">Ingresa tus datos para acceder a tu cuenta</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-surface text-sm font-bold ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-surface/40 text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background-light/30 text-surface placeholder:text-surface/30 transition-all outline-none"
                  placeholder="tu@ejemplo.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-surface text-sm font-bold">Contraseña</label>
                <Link href="/" className="text-primary text-xs font-bold hover:underline transition-all">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-surface/40 text-[20px]">lock_open</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-lg border border-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background-light/30 text-surface placeholder:text-surface/30 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface/40 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-primary/20 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-surface/70 text-sm cursor-pointer select-none">
                Recordarme por 30 días
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-surface/60 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Crear una cuenta
              </Link>
            </p>
          </div>
        </div>
    </PageLayout>
  );
}

export default LoginPage;
