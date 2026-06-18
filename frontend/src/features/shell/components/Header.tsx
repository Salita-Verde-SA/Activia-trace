import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAvisosAlumno } from '@/features/alumno/hooks/useAlumno';

export const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: avisos } = useAvisosAlumno();
  const noLeidos = avisos?.filter(a => a.requiere_ack && !a.ack_at).length ?? 0;

  return (
    <header className="fixed top-4 right-4 w-[calc(100%-2rem)] lg:w-[calc(100%-20rem)] z-50 backdrop-blur-xl bg-white/5 rounded-3xl flex justify-between items-center px-margin-x h-20 transition-all duration-300 border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 mr-2 text-on-surface hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex flex-col items-end mr-4">
          <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
            Tenant ID
          </span>
          <span className="text-sm font-data-mono text-alabaster">
            {user?.tenant_id?.substring(0, 8) || '----'}
          </span>
        </div>
        <button
          onClick={() => navigate('/mis-avisos')}
          title="Mis avisos"
          className="relative text-on-surface-variant hover:text-muted-gold transition-colors cursor-pointer w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 backdrop-blur-xl border border-transparent hover:border-white/10"
        >
          <span className="material-symbols-outlined">notifications</span>
          {noLeidos > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {noLeidos > 9 ? '9+' : noLeidos}
            </span>
          )}
        </button>
        <button 
          onClick={logout}
          className="text-on-surface-variant hover:text-pale-rose transition-colors cursor-pointer w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 backdrop-blur-xl border border-transparent hover:border-white/10"
          title="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
        <div className="w-10 h-10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden ml-2 rounded-2xl flex items-center justify-center bg-charcoal text-muted-gold font-label-caps text-sm">
          {user?.username?.substring(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};
