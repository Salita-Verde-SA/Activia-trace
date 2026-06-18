import React, { useState } from 'react';
import { useAtrasados } from '../hooks/useCalificaciones';

interface AtrasadosPanelProps {
  materiaId: string;
  onContactar: (usuarioId: string) => void;
  onContactarTodos: (usuarioIds: string[]) => void;
}

export const AtrasadosPanel: React.FC<AtrasadosPanelProps> = ({ materiaId, onContactar, onContactarTodos }) => {
  const { data: reporte, isLoading, error } = useAtrasados(materiaId);
  const [selectedUsuarioIds, setSelectedUsuarioIds] = useState<Set<string>>(new Set());

  if (isLoading) return <div>Cargando reporte de atrasados...</div>;
  if (error) return <div className="text-red-500">Error al cargar alumnos atrasados.</div>;
  if (!reporte) return null;

  // Solo los alumnos con usuario vinculado pueden recibir un aviso dirigido.
  const contactables = reporte.alumnos_atrasados.filter(a => a.usuario_id);

  const toggleSelectAll = () => {
    if (selectedUsuarioIds.size === contactables.length) {
      setSelectedUsuarioIds(new Set());
    } else {
      setSelectedUsuarioIds(new Set(contactables.map(a => a.usuario_id as string)));
    }
  };

  const toggleSelect = (usuarioId: string) => {
    const next = new Set(selectedUsuarioIds);
    if (next.has(usuarioId)) next.delete(usuarioId);
    else next.add(usuarioId);
    setSelectedUsuarioIds(next);
  };

  const handleContactarSeleccionados = () => {
    if (selectedUsuarioIds.size > 0) {
      onContactarTodos(Array.from(selectedUsuarioIds));
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
          disabled={selectedUsuarioIds.size === 0}
          className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-md font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          Contactar ({selectedUsuarioIds.size})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsuarioIds.size === contactables.length && contactables.length > 0}
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
                    disabled={!alumno.usuario_id}
                    checked={!!alumno.usuario_id && selectedUsuarioIds.has(alumno.usuario_id)}
                    onChange={() => alumno.usuario_id && toggleSelect(alumno.usuario_id)}
                    className="rounded bg-black/20 border-white/10 text-red-500 focus:ring-red-500/50 focus:ring-offset-0 disabled:opacity-40"
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
                  {alumno.usuario_id ? (
                    <button
                      onClick={() => onContactar(alumno.usuario_id as string)}
                      className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors"
                    >
                      Contactar
                    </button>
                  ) : (
                    <span className="text-white/30 text-xs italic" title="Alumno sin usuario vinculado">Sin usuario</span>
                  )}
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
