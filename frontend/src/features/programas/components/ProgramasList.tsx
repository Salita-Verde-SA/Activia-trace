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
    <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-white">Programas de Materia</h2>
      <ul className="space-y-2">
        {programas?.map(programa => (
          <li key={programa.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">description</span>
              <div>
                <p className="font-semibold text-white">{programa.version ? `Versión ${programa.version}` : 'Sin versión'}</p>
                <p className="text-sm text-gray-400 font-mono">Ref: {programa.referencia_archivo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`/api/v1/programas/${programa.id}/archivo`}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Descargar PDF"
              >
                <span className="material-symbols-outlined">download</span>
              </a>
              <button 
                onClick={() => deletePrograma(programa.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Eliminar programa"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </li>
        ))}
        {programas?.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-2 block">folder_off</span>
            <p className="text-gray-400">No hay programas cargados.</p>
          </div>
        )}
      </ul>
    </div>
  );
};
