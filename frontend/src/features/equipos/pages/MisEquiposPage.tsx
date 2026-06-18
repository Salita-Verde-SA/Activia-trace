import { useQuery } from '@tanstack/react-query';
import { equiposApi } from '../services/equiposApi';
import type { AsignacionDetalleView } from '../types';

export function MisEquiposPage() {
  const { data: asignaciones, isLoading, error } = useQuery({
    queryKey: ['mis-equipos-detalle'],
    queryFn: () => equiposApi.getMisEquiposDetalle(),
  });

  if (isLoading) return <div className="p-6 text-white/50">Cargando tus equipos...</div>;
  if (error) return <div className="p-6 text-red-400">Error al cargar equipos</div>;

  if (!asignaciones || asignaciones.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-white/90 mb-6">Mis Equipos</h1>
        <div className="text-center py-16 text-white/50 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-4xl mb-3 block">groups</span>
          <p className="text-lg">No tenés asignaciones de equipos activas.</p>
          <p className="text-sm mt-1">Comunicate con el coordinador si creés que esto es un error.</p>
        </div>
      </div>
    );
  }

  const today = new Date();

  const getEstado = (a: AsignacionDetalleView) => {
    if (a.hasta && new Date(a.hasta) < today) return 'Vencida';
    return 'Vigente';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-white/90 mb-2">Mis Equipos</h1>
      <p className="text-sm text-white/70 mb-6">Tus asignaciones como docente</p>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Materia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Carrera</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Cohorte</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Vigencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {asignaciones.map(a => {
              const estado = getEstado(a);
              return (
                <tr key={a.asignacion_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white/90">{a.materia_nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-white/70">{a.carrera_nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-white/70">{a.cohorte_nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-0.5 rounded border border-primary-500/30 bg-primary-500/20 text-primary-300 text-xs font-semibold">
                      {a.rol_nombre ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    <div>Desde: {new Date(a.desde).toLocaleDateString()}</div>
                    {a.hasta && <div>Hasta: {new Date(a.hasta).toLocaleDateString()}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${
                      estado === 'Vigente'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
