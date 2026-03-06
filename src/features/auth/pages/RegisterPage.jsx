import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth.api';
import PageLayout from '@/shared/components/PageLayout';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(email, password);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error registrando usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[520px] bg-white rounded-xl shadow-xl overflow-hidden border border-primary/5">
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-surface text-3xl font-extrabold tracking-tight mb-2">Crea tu cuenta</h1>
              <p className="text-surface/60 text-base font-medium">Únete a Mebsy y disfruta de una experiencia única.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg mb-6 text-sm">
                ¡Registro exitoso! Redirigiendo al inicio de sesión...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-surface text-sm font-semibold tracking-wide">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xl">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background-light/30 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 text-surface placeholder:text-surface/30 text-base transition-all outline-none"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-surface text-sm font-semibold tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xl">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-primary/10 bg-background-light/30 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 pr-12 text-surface placeholder:text-surface/30 text-base transition-all outline-none"
                    placeholder="Crea una contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="ml-1 text-xs text-surface/40">Debe tener al menos 8 caracteres</p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-surface text-sm font-semibold tracking-wide">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xl">verified_user</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background-light/30 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 text-surface placeholder:text-surface/30 text-base transition-all outline-none"
                    placeholder="Confirma tu contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : success ? '¡Cuenta creada!' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-surface/60 text-sm font-medium">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
    </PageLayout>
  );
}

export default RegisterPage;
