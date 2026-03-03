import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth.api';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden pt-24">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 mb-2">Iniciar Sesión</h1>
              <p className="text-gray-400">Bienvenido de vuelta</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="tu@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2">Recuérdame</span>
                </label>
                <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="font-bold text-white hover:text-purple-400 transition-colors">
                  Crear Cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;

