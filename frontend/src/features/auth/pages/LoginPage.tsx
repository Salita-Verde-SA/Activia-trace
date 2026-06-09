import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { LogIn } from 'lucide-react';

export const LoginPage = () => {
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: formData.get('email'),
      password: formData.get('password')
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-noir relative overflow-hidden">
      {/* Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="ambient-glow-gold top-[10%] right-[20%]"></div>
        <div className="ambient-glow-rose bottom-[10%] left-[20%]"></div>
      </div>

      <div className="w-full max-w-md backdrop-blur-xl bg-charcoal border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-10 animate-fade-in relative">
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-inner">
            <LogIn className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(242,202,80,0.5)]" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-title-lg text-primary tracking-wider drop-shadow-[0_0_8px_rgba(242,202,80,0.4)] uppercase">trace</h1>
          <p className="font-label-caps text-[10px] text-tertiary-fixed-dim uppercase tracking-[0.3em] mt-2">Authentication Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-alabaster shadow-inner placeholder-on-surface-variant/50 focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-alabaster shadow-inner placeholder-on-surface-variant/50 focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full justify-center items-center space-x-2 rounded-2xl bg-white/5 border border-primary/30 px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(197,160,89,0.1)] hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(197,160,89,0.2)] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-noir disabled:opacity-50"
          >
            <span>{loginMutation.isPending ? 'Iniciando...' : 'Ingresar'}</span>
            {!loginMutation.isPending && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
          
          {loginMutation.isError && (
            <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error text-center font-body-sm">
              Credenciales inválidas. Por favor intente nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
