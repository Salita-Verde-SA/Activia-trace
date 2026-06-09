import { useAuth } from '@/features/auth/context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="mb-stack-lg relative backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        <h2 className="font-display-lg text-display-lg text-alabaster mb-2 uppercase tracking-widest drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">Academic Overview</h2>
        <p class="font-body-main text-body-main text-on-surface-variant max-w-2xl tracking-wide">
          Institutional Portal — Session Active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Metric Card 1 */}
        <div className="backdrop-blur-xl bg-charcoal border border-white/10 rounded-3xl p-8 hover:border-muted-gold/40 transition-all duration-300 group">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em] group-hover:text-muted-gold transition-colors">
            Current Identity
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-display-lg-mobile text-alabaster tracking-widest group-hover:drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
              {user?.username || 'Guest'}
            </span>
          </div>
          <div className="mt-4 w-full h-[1px] bg-white/10 group-hover:bg-muted-gold/50 transition-colors rounded-full"></div>
        </div>

        {/* Metric Card 2 */}
        <div className="backdrop-blur-xl bg-charcoal border border-white/10 rounded-3xl p-8 hover:border-pale-rose/40 transition-all duration-300 group">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em] group-hover:text-pale-rose transition-colors">
            Active Tenant
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-display-lg-mobile text-pale-rose tracking-widest">
              {user?.tenant_id ? user.tenant_id.substring(0, 8) : 'None'}
            </span>
            <span className="font-body-sm text-on-surface-variant uppercase text-[10px]">ID</span>
          </div>
          <div className="mt-4 w-full h-[1px] bg-white/10 group-hover:bg-pale-rose/50 transition-colors rounded-full"></div>
        </div>

        {/* Metric Card 3 */}
        <div className="backdrop-blur-xl bg-charcoal border border-white/10 rounded-3xl p-8 hover:border-muted-gold/40 transition-all duration-300 group">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em] group-hover:text-muted-gold transition-colors">
            Assigned Roles
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {user?.roles?.map((role) => (
              <span key={role} className="inline-flex items-center px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-2xl text-alabaster font-label-caps text-[10px] uppercase tracking-widest border border-white/10">
                {role}
              </span>
            ))}
          </div>
          <div className="mt-4 w-full h-[1px] bg-white/10 group-hover:bg-muted-gold/50 transition-colors rounded-full"></div>
        </div>
      </div>
      
      <div className="backdrop-blur-xl bg-charcoal border border-white/10 rounded-3xl p-8">
        <h3 className="font-title-lg text-alabaster uppercase tracking-widest mb-4">Raw Session Data</h3>
        <div className="bg-noir p-4 rounded-xl border border-white/5 overflow-auto">
          <pre className="font-data-mono text-on-surface-variant text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
