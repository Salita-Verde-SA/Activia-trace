import { useAuth } from '@/features/auth/context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-primary-600 hidden lg:block">Activia Trace</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Tenant: <span className="font-bold">{user?.tenant_id?.substring(0, 8)}...</span>
        </span>
        <button
          onClick={logout}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </button>
      </div>
    </header>
  );
};
