import React from 'react';
import { useAvisoMetrics } from '../hooks/useAvisos';

interface AckTrackerProps {
  avisoId: string;
}

export const AckTracker: React.FC<AckTrackerProps> = ({ avisoId }) => {
  const { data: metrics, isLoading, error } = useAvisoMetrics(avisoId);

  if (isLoading) return <div className="text-sm text-gray-500">Cargando métricas...</div>;
  if (error || !metrics) return <div className="text-sm text-red-500">Error al cargar métricas</div>;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
      <h4 className="text-sm font-bold text-white/90 mb-4">Seguimiento de Lectura</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Alcance Total</p>
          <p className="text-xl font-semibold text-white/90">{metrics.alcance_total}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Leídos</p>
          <p className="text-xl font-semibold text-green-400">{metrics.leidos_count} <span className="text-sm font-medium text-green-400/70">({metrics.porcentaje_leidos.toFixed(1)}%)</span></p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 col-span-2">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-xl font-semibold text-yellow-400">{metrics.pendientes_count}</p>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mt-4 overflow-hidden">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out"  
          style={{ width: `${metrics.porcentaje_leidos}%` }}
        ></div>
      </div>
    </div>
  );
};
