import type { AuditoriaRegistro } from '../types';
import { AuditDetailFormatter } from './AuditDetailFormatter';

interface AuditoriaTableProps {
  registros: AuditoriaRegistro[];
  isLoading: boolean;
}

export const AuditoriaTable: React.FC<AuditoriaTableProps> = ({ registros, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-12 bg-surface border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className="bg-surface border border-white/5 rounded-3xl p-12 text-center backdrop-blur-xl">
        <p className="font-serif text-on-surface-variant text-lg">No se encontraron registros de auditoría.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Fecha/Hora</th>
              <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Actor</th>
              <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Acción</th>
              <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Detalle</th>
              <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Contexto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {registros.map((reg) => (
              <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-sm text-alabaster">
                  {new Date(reg.fecha_hora).toLocaleString()}
                </td>
                <td className="p-4 text-sm font-mono text-alabaster/80">
                  {reg.actor_id.substring(0, 8)}...
                </td>
                <td className="p-4 text-sm font-mono text-primary">
                  {reg.accion}
                </td>
                <td className="p-4 align-middle">
                  <AuditDetailFormatter accion={reg.accion} detalle={reg.detalle} />
                </td>
                <td className="p-4 text-xs font-mono text-on-surface-variant/70">
                  {reg.tenant_id.substring(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
