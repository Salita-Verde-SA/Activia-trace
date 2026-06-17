import React from 'react';
import { useSabana } from '../hooks/useCalificaciones';

interface SabanaPanelProps {
  materiaId: string;
}

export const SabanaPanel: React.FC<SabanaPanelProps> = ({ materiaId }) => {
  const { data: sabana, isLoading, error } = useSabana(materiaId);

  if (isLoading) return <div className="text-white/50 text-sm">Cargando sábana...</div>;
  if (error) return <div className="text-red-400 text-sm">Error al cargar sábana de calificaciones.</div>;
  if (!sabana) return null;

  if (sabana.alumnos.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center text-white/50 text-sm">
        Sin alumnos en el padrón activo.
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-serif text-white/90">Sábana de Calificaciones</h2>
        {sabana.actividades_headers.length === 0 && (
          <p className="text-sm text-white/50 mt-1">Sin calificaciones importadas aún.</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase sticky left-0 bg-gray-900/80 z-10 min-w-[180px]">
                Alumno
              </th>
              {sabana.actividades_headers.map(act => (
                <th key={act} className="px-3 py-3 text-center text-xs font-medium text-white/50 uppercase whitespace-nowrap">
                  {act}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sabana.alumnos.map(alumno => (
              <tr key={alumno.entrada_padron_id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-2.5 sticky left-0 bg-gray-900/80 z-10">
                  <div className="font-medium text-white/90">{alumno.nombre} {alumno.apellido}</div>
                  <div className="text-xs text-white/40">{alumno.email}</div>
                </td>
                {sabana.actividades_headers.map(act => {
                  const calif = alumno.calificaciones[act];
                  if (!calif) {
                    return (
                      <td key={act} className="px-3 py-2.5 text-center text-white/30">—</td>
                    );
                  }
                  const valor = calif.nota_numerica !== null
                    ? calif.nota_numerica
                    : (calif.nota_textual ?? '—');
                  return (
                    <td key={act} className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                        calif.aprobado
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {valor}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
