import React from 'react';
import { useFechas } from '../hooks/useFechas';
import type { TipoFechaAcademica } from '../types';

interface FechasListProps {
  materiaId: string;
}

export const FechasList: React.FC<FechasListProps> = ({ materiaId }) => {
  const { data: fechas, isLoading, error, deleteFecha } = useFechas(materiaId);

  if (isLoading) return <div>Cargando fechas académicas...</div>;
  if (error) return <div>Error al cargar fechas</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Fechas Académicas (Calendario)</h2>
      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700">
        Agregar Fecha
      </button>
      <div className="grid grid-cols-1 gap-4">
        {fechas?.map(fecha => (
          <div key={fecha.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded mb-2">
                {fecha.tipo}
              </span>
              <h3 className="font-bold">{fecha.titulo || 'Sin título'}</h3>
              <p className="text-sm text-gray-600">{new Date(fecha.fecha).toLocaleDateString()}</p>
              {fecha.es_feriado && <p className="text-xs text-red-500 font-bold mt-1">Feriado</p>}
            </div>
            <div className="flex items-start">
              <button 
                onClick={() => deleteFecha(fecha.id)}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
        {fechas?.length === 0 && (
          <p className="text-gray-500">No hay fechas agendadas.</p>
        )}
      </div>
    </div>
  );
};
