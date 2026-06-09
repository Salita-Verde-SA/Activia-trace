import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

export const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) => {
  const { user } = useAuth();
  
  // Basic filtering based on roles
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['ALUMNO', 'PROFESOR', 'COORDINADOR', 'ADMIN', 'FINANZAS', 'NEXO', 'TUTOR'] },
    { name: 'Mi Estado', path: '/alumno/estado', icon: 'school', roles: ['ALUMNO'] },
    { name: 'Mis Avisos', path: '/alumno/avisos', icon: 'notifications', roles: ['ALUMNO'] },
    { name: 'Coloquios', path: '/alumno/coloquios', icon: 'calendar_today', roles: ['ALUMNO'] },
    { name: 'Calificaciones', path: '/calificaciones', icon: 'grade', roles: ['PROFESOR', 'TUTOR', 'COORDINADOR', 'ADMIN'] },
    { name: 'Monitor Global', path: '/admin/monitor', icon: 'bar_chart', roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Avisos', path: '/admin/avisos', icon: 'campaign', roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Tareas', path: '/admin/tareas', icon: 'task', roles: ['COORDINADOR', 'ADMIN'] },
    { name: 'Estructura Académica', path: '/admin/estructura', icon: 'account_tree', roles: ['ADMIN'] },
    { name: 'Usuarios', path: '/admin/usuarios', icon: 'group', roles: ['ADMIN'] },
    { name: 'Auditoría', path: '/admin/auditoria', icon: 'history_edu', roles: ['ADMIN'] },
    { name: 'Grilla Salarial', path: '/finanzas/salarios', icon: 'payments', roles: ['FINANZAS'] },
    { name: 'Liquidaciones', path: '/finanzas/liquidaciones', icon: 'receipt_long', roles: ['FINANZAS'] },
  ];

  const visibleItems = menuItems.filter(item => 
    !user?.roles?.length || item.roles.some(r => user.roles.includes(r))
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <nav 
        className={`fixed inset-y-0 left-0 z-30 w-64 backdrop-blur-xl bg-white/5 flex flex-col py-stack-md transition-all duration-300 ease-in-out border-r border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.3)] lg:rounded-r-3xl lg:my-4 lg:ml-4 lg:h-[calc(100vh-2rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 mb-stack-lg flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl border border-white/10 shadow-inner">
            <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">account_balance</span>
          </div>
          <div>
            <h1 className="font-display-lg text-title-lg text-primary tracking-wider drop-shadow-[0_0_8px_rgba(242,202,80,0.4)]">trace</h1>
            <p className="font-label-caps text-[10px] text-tertiary-fixed-dim uppercase tracking-[0.3em] mt-1">Academic Portal</p>
          </div>
        </div>
        
        <button className="mx-6 mb-stack-md bg-white/5 backdrop-blur-xl border border-muted-gold/30 rounded-2xl shadow-[0_0_15px_rgba(197,160,89,0.1)] text-muted-gold font-label-caps text-label-caps py-3 px-4 flex items-center justify-center space-x-2 hover:text-white hover:bg-white/10 hover:border-muted-gold/50 hover:shadow-[0_0_25px_rgba(197,160,89,0.2)] transition-all duration-300">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Record</span>
        </button>

        <div className="flex-1 overflow-y-auto mt-4 px-3">
          <ul className="space-y-2">
            {visibleItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center space-x-4 py-3 px-4 rounded-2xl transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-widest backdrop-blur-xl border ${
                      isActive 
                        ? 'text-primary bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border-white/5 drop-shadow-[0_0_5px_rgba(242,202,80,0.5)]' 
                        : 'text-on-tertiary-fixed-variant border-transparent hover:border-white/5 hover:bg-white/5 hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto px-3">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center space-x-4 py-3 text-on-tertiary-fixed-variant px-4 rounded-2xl hover:text-on-surface transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-widest border border-transparent hover:border-white/5 hover:bg-white/5 backdrop-blur-xl">
                <span className="material-symbols-outlined">help_outline</span>
                <span>Support</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};
