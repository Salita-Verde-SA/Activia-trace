import { useAuth } from '@/features/auth/context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-secondary-900 mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Bienvenido a Activia Trace</h2>
        <p className="text-gray-600 mb-4">
          Estás autenticado en el sistema.
        </p>
        
        <div className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
