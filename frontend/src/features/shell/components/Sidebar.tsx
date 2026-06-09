import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LayoutDashboard, Users, BookOpen, Settings, CheckSquare, Bell, BarChart2, DollarSign, FileText, Calendar } from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) => {
  const { user } = useAuth();
  
  // Basic filtering based on roles (mocked for now)
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['ALUMNO', 'PROFESOR', 'COORDINADOR', 'ADMIN', 'FINANZAS', 'NEXO', 'TUTOR'] },
    { name: 'Mi Estado', path: '/alumno/estado', icon: <BookOpen className="w-5 h-5" />, roles: ['ALUMNO'] },
    { name: 'Mis Avisos', path: '/alumno/avisos', icon: <Bell className="w-5 h-5" />, roles: ['ALUMNO'] },
    { name: 'Coloquios', path: '/alumno/coloquios', icon: <Calendar className="w-5 h-5" />, roles: ['ALUMNO'] },
    { name: 'Calificaciones', path: '/calificaciones', icon: <BookOpen className="w-5 h-5" />, roles: ['PROFESOR', 'TUTOR', 'COORDINADOR', 'ADMIN'] },
    { name: 'Monitor Global', path: '/admin/monitor', icon: <BarChart2 className="w-5 h-5" />, roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Avisos', path: '/admin/avisos', icon: <Bell className="w-5 h-5" />, roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Tareas', path: '/admin/tareas', icon: <CheckSquare className="w-5 h-5" />, roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Estructura Académica', path: '/admin/estructura', icon: <BookOpen className="w-5 h-5" />, roles: ['ADMIN'] },
    { name: 'Usuarios', path: '/admin/usuarios', icon: <Users className="w-5 h-5" />, roles: ['ADMIN'] },
    { name: 'Auditoría', path: '/admin/auditoria', icon: <Settings className="w-5 h-5" />, roles: ['ADMIN'] },
    { name: 'Grilla Salarial', path: '/finanzas/salarios', icon: <DollarSign className="w-5 h-5" />, roles: ['FINANZAS'] },
    { name: 'Liquidaciones', path: '/finanzas/liquidaciones', icon: <FileText className="w-5 h-5" />, roles: ['FINANZAS'] },
  ];

  const visibleItems = menuItems.filter(item => 
    !user?.roles?.length || item.roles.some(r => user.roles.includes(r))
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-secondary-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-secondary-800 lg:hidden">
          <h2 className="text-xl font-bold text-white">Activia Trace</h2>
        </div>
        
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:bg-secondary-800 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
