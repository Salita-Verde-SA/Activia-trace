import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { LogIn } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export const LoginPage = () => {
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string
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
          <Input
            id="email"
            name="email"
            type="email"
            label="Correo Electrónico"
            required
            placeholder="tu@email.com"
            disabled={loginMutation.isPending}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            required
            placeholder="••••••••"
            disabled={loginMutation.isPending}
          />
          
          <Button
            type="submit"
            isLoading={loginMutation.isPending}
            className="w-full mt-2"
          >
            <span>{loginMutation.isPending ? 'Iniciando...' : 'Ingresar'}</span>
            {!loginMutation.isPending && <span className="material-symbols-outlined text-[18px] ml-2">arrow_forward</span>}
          </Button>
          
          {loginMutation.isError && (
            <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error text-center font-body-sm animate-fade-in">
              Credenciales inválidas. Por favor intente nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

