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
    <div className="flex min-h-screen items-center justify-center bg-secondary-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary-100 p-3">
            <LogIn className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900">
          Iniciar Sesión en Activia Trace
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-900" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-900" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Iniciando...' : 'Ingresar'}
          </button>
          
          {loginMutation.isError && (
            <div className="mt-2 text-sm text-red-600">
              Credenciales inválidas. Por favor intente nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
