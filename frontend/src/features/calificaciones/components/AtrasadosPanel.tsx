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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-red-100">
      <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-red-800">Alumnos en Riesgo (Atrasados)</h2>
          <p className="text-sm text-red-600">
            {reporte.total_alumnos_atrasados} de {reporte.total_alumnos_padron} estudiantes tienen actividades desaprobadas o faltantes.
          </p>
        </div>
        <button 
          onClick={handleContactarSeleccionados}
          disabled={selectedIds.size === 0}
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          Contactar ({selectedIds.size})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === reporte.alumnos_atrasados.length && reporte.alumnos_atrasados.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-red-600"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actividades Pendientes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reporte.alumnos_atrasados.map((alumno) => (
              <tr key={alumno.entrada_padron_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(alumno.entrada_padron_id)}
                    onChange={() => toggleSelect(alumno.entrada_padron_id)}
                    className="rounded border-gray-300 text-red-600"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{alumno.nombre} {alumno.apellido}</div>
                  <div className="text-sm text-gray-500">{alumno.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {alumno.actividades_no_aprobadas.map((act, i) => (
                      <span key={i} className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {act.actividad_nombre} ({act.nota_numerica ?? act.nota_textual ?? 'S/N'})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onContactar(alumno.entrada_padron_id)}
                    className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
                  >
                    Contactar
                  </button>
                </td>
              </tr>
            ))}
            {reporte.alumnos_atrasados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
