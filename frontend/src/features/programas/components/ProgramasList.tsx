import React from 'react';
import { useProgramas } from '../hooks/useProgramas';

interface ProgramasListProps {
  materiaId: string;
}

export const ProgramasList: React.FC<ProgramasListProps> = ({ materiaId }) => {
  const { data: programas, isLoading, error, deletePrograma } = useProgramas(materiaId);

  if (isLoading) return <div>Cargando programas...</div>;
  if (error) return <div>Error al cargar programas</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Programas de Materia</h2>
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700">
        Subir Programa
      </button>
      <ul className="space-y-2">
        {programas?.map(programa => (
          <li key={programa.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <div>
              <p className="font-semibold">{programa.version || 'Sin versión'}</p>
              <p className="text-sm text-gray-500">Ref: {programa.referencia_archivo}</p>
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => deletePrograma(programa.id)}
                className="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {programas?.length === 0 && (
          <p className="text-gray-500">No hay programas cargados.</p>
        )}
      </ul>
    </div>
  );
};
