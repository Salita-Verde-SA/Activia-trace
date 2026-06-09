import React, { useState } from 'react';
import { useAtrasados } from '../hooks/useCalificaciones';

interface AtrasadosPanelProps {
  materiaId: string;
  onContactar: (alumnoId: string) => void;
  onContactarTodos: (alumnoIds: string[]) => void;
}

export const AtrasadosPanel: React.FC<AtrasadosPanelProps> = ({ materiaId, onContactar, onContactarTodos }) => {
  const { data: reporte, isLoading, error } = useAtrasados(materiaId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (isLoading) return <div>Cargando reporte de atrasados...</div>;
  if (error) return <div className="text-red-500">Error al cargar alumnos atrasados.</div>;
  if (!reporte) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === reporte.alumnos_atrasados.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reporte.alumnos_atrasados.map(a => a.entrada_padron_id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleContactarSeleccionados = () => {
    if (selectedIds.size > 0) {
      onContactarTodos(Array.from(selectedIds));
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
      <div className="bg-red-500/10 p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif text-red-400">Alumnos en Riesgo (Atrasados)</h2>
          <p className="text-sm text-red-400/80">
            {reporte.total_alumnos_atrasados} de {reporte.total_alumnos_padron} estudiantes tienen actividades desaprobadas o faltantes.
          </p>
        </div>
        <button 
          onClick={handleContactarSeleccionados}
          disabled={selectedIds.size === 0}
          className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-md font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          Contactar ({selectedIds.size})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === reporte.alumnos_atrasados.length && reporte.alumnos_atrasados.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded bg-black/20 border-white/10 text-red-500 focus:ring-red-500/50 focus:ring-offset-0"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Alumno</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Actividades Pendientes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {reporte.alumnos_atrasados.map((alumno) => (
              <tr key={alumno.entrada_padron_id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(alumno.entrada_padron_id)}
                    onChange={() => toggleSelect(alumno.entrada_padron_id)}
                    className="rounded bg-black/20 border-white/10 text-red-500 focus:ring-red-500/50 focus:ring-offset-0"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-white/90">{alumno.nombre} {alumno.apellido}</div>
                  <div className="text-sm text-white/50">{alumno.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {alumno.actividades_no_aprobadas.map((act, i) => (
                      <span key={i} className="inline-block px-2 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                        {act.actividad_nombre} ({act.nota_numerica ?? act.nota_textual ?? 'S/N'})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onContactar(alumno.entrada_padron_id)}
                    className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors"
                  >
                    Contactar
                  </button>
                </td>
              </tr>
            ))}
            {reporte.alumnos_atrasados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                  No hay alumnos atrasados en esta comisión.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
