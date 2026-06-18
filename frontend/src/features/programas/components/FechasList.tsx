import React from 'react';
import { useFechas } from '../hooks/useFechas';
import type { TipoFechaAcademica } from '../types';

interface FechasListProps {
  materiaId: string;
}

const getBadgeColor = (tipo: TipoFechaAcademica | string) => {
  switch (tipo) {
    case 'PARCIAL': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    case 'RECUPERATORIO': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    case 'TP': return 'bg-green-500/20 text-green-300 border border-green-500/30';
    case 'FINAL':
    case 'COLOQUIO': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    default: return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  }
};

export const FechasList: React.FC<FechasListProps> = ({ materiaId }) => {
  const { data: fechas, isLoading, error, deleteFecha } = useFechas(materiaId);

  if (isLoading) return <div>Cargando fechas académicas...</div>;
  if (error) return <div>Error al cargar fechas</div>;

  return (
    <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-white">Fechas Académicas (Calendario)</h2>
      <div className="grid grid-cols-1 gap-4">
        {fechas?.map(fecha => (
          <div key={fecha.id} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center">
            <div className="flex gap-4 items-start">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-primary text-3xl block">event</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${getBadgeColor(fecha.tipo)}`}>
                    {fecha.tipo}
                  </span>
                  {fecha.es_feriado && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      Feriado
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-lg">{fecha.titulo || 'Sin título'}</h3>
                <p className="text-sm text-gray-400 mt-1">{new Date(fecha.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => deleteFecha(fecha.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Eliminar fecha"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
        {fechas?.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-2 block">event_busy</span>
            <p className="text-gray-400">No hay fechas agendadas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
