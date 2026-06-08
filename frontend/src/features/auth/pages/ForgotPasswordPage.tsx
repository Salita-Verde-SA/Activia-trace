import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary-100 p-3">
            <KeyRound className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-2xl font-bold text-secondary-900">
          Recuperar Contraseña
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Ingrese su correo electrónico y le enviaremos instrucciones para reiniciar su clave.
        </p>
        
        <form className="space-y-4">
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
          
          <button
            type="button"
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Enviar Instrucciones
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
