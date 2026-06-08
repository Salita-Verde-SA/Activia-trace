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
    <div className="bg-gray-50 rounded p-4 border border-gray-200">
      <h4 className="text-sm font-bold text-gray-700 mb-2">Seguimiento de Lectura</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Alcance Total</p>
          <p className="text-lg font-semibold">{metrics.alcance_total}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Leídos</p>
          <p className="text-lg font-semibold text-green-600">{metrics.leidos_count} ({metrics.porcentaje_leidos.toFixed(1)}%)</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Pendientes</p>
          <p className="text-lg font-semibold text-yellow-600">{metrics.pendientes_count}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
        <div 
          className="bg-green-600 h-2.5 rounded-full" 
          style={{ width: `${metrics.porcentaje_leidos}%` }}
        ></div>
      </div>
    </div>
  );
};
