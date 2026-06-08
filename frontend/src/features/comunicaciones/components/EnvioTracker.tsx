import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLoteStatus } from '../services/comunicacionesApi';

interface EnvioTrackerProps {
  loteId: string;
  onClose: () => void;
}

export const EnvioTracker: React.FC<EnvioTrackerProps> = ({ loteId, onClose }) => {
  // Polling cada 3 segundos si hay pendientes o enviando
  const [shouldPoll, setShouldPoll] = useState(true);

  const { data: lote, isLoading } = useQuery({
    queryKey: ['lote', loteId],
    queryFn: () => getLoteStatus(loteId),
    refetchInterval: shouldPoll ? 3000 : false,
  });

  useEffect(() => {
    if (lote) {
      const isComplete = lote.comunicaciones.every(
        c => c.estado === 'Enviado' || c.estado === 'Error' || c.estado === 'Cancelado'
      );
      if (isComplete) {
        setShouldPoll(false);
      }
    }
  }, [lote]);

  if (isLoading) {
    return <div className="p-4 bg-white rounded shadow text-center">Consultando estado del lote...</div>;
  }

  if (!lote) return null;

  const totales = lote.comunicaciones.length;
  const enviados = lote.comunicaciones.filter(c => c.estado === 'Enviado').length;
  const errores = lote.comunicaciones.filter(c => c.estado === 'Error').length;
  const pendientes = lote.comunicaciones.filter(c => c.estado === 'Pendiente' || c.estado === 'Enviando').length;

  const pct = Math.round(((enviados + errores) / totales) * 100) || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto border">
      <h2 className="text-xl font-bold mb-4">Progreso de Envío</h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-blue-700">Progreso</span>
          <span className="text-sm font-medium text-blue-700">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-green-50 p-2 rounded border border-green-100">
          <p className="text-2xl font-bold text-green-600">{enviados}</p>
          <p className="text-xs text-gray-500 uppercase">Enviados</p>
        </div>
        <div className="bg-red-50 p-2 rounded border border-red-100">
          <p className="text-2xl font-bold text-red-600">{errores}</p>
          <p className="text-xs text-gray-500 uppercase">Errores</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
          <p className="text-2xl font-bold text-yellow-600">{pendientes}</p>
          <p className="text-xs text-gray-500 uppercase">En Cola</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          {shouldPoll ? 'Ocultar' : 'Cerrar'}
        </button>
      </div>
    </div>
  );
};
