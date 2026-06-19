import { useState } from 'react';
import { useListarGuardias } from '../hooks/useGuardias';
import type { GuardiaResponse } from '../types';

function exportarCSV(guardias: GuardiaResponse[]) {
  const headers = ['ID', 'Asignacion', 'Materia', 'Dia', 'Horario', 'Estado', 'Comentarios', 'Fecha'];
  const rows = guardias.map(g => [
    g.id,
    g.asignacion_id,
    g.materia_id,
    g.dia,
    g.horario,
    g.estado,
    g.comentarios ?? '',
    new Date(g.creada_at).toLocaleDateString('es-AR'),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'guardias.csv');
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  URL.revokeObjectURL(url);
}

export function GuardiasAdminPage() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(thirtyDaysAgo);
  const [fechaHasta, setFechaHasta] = useState(today);
  const [buscarFechas, setBuscarFechas] = useState<{ desde: string; hasta: string } | null>(null);

  const guardiasQuery = useListarGuardias(
    buscarFechas?.desde ?? null,
    buscarFechas?.hasta ?? null
  );

  const guardias = guardiasQuery.data ?? [];

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setBuscarFechas({ desde: fechaDesde, hasta: fechaHasta });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Guardias</h1>
        <p className="mt-1 text-sm text-white/70">Consultá y exportá el registro de guardias del equipo.</p>
      </div>

      {/* Filtros */}
      <form
        onSubmit={handleBuscar}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex flex-wrap gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            required
            className="bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            required
            className="bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={guardiasQuery.isFetching}
          className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {guardiasQuery.isFetching && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          )}
          Buscar
        </button>
        <button
          type="button"
          disabled={guardias.length === 0}
          onClick={() => exportarCSV(guardias)}
          className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Exportar CSV
        </button>
      </form>

      {/* Resultados */}
      {!buscarFechas ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-3 block">search</span>
          <p className="text-white/50 text-sm">Seleccioná un rango de fechas y hacé click en Buscar.</p>
        </div>
      ) : guardiasQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
        </div>
      ) : guardias.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-3 block">security</span>
          <p className="text-white/50 text-sm">No hay guardias registradas en el período seleccionado.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <span className="text-sm text-white/70">{guardias.length} guardia{guardias.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/80">
              <thead className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-4 py-2 text-left">Día</th>
                  <th className="px-4 py-2 text-left">Horario</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Comentarios</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {guardias.map(g => (
                  <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{g.dia}</td>
                    <td className="px-4 py-2">{g.horario}</td>
                    <td className="px-4 py-2">
                      <EstadoBadge estado={g.estado} />
                    </td>
                    <td className="px-4 py-2 text-white/50 max-w-xs truncate">{g.comentarios ?? '—'}</td>
                    <td className="px-4 py-2 text-white/50">
                      {new Date(g.creada_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    Pendiente: 'bg-yellow-500/20 text-yellow-300',
    Realizada: 'bg-green-500/20 text-green-300',
    Cancelada: 'bg-red-500/20 text-red-300',
  };
  return (
    <span
      className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
        colors[estado] ?? 'bg-white/10 text-white/50'
      }`}
    >
      {estado}
    </span>
  );
}
