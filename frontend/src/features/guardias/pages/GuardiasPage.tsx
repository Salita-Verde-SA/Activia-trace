import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRegistrarGuardia, useMisGuardias } from '../hooks/useGuardias';
import { DIA_SEMANA_OPTIONS, type DiaSemana } from '../types';
import api from '@/shared/services/api';
import type { AsignacionResponse, AsignacionDetalleView } from '@/features/equipos/types';

interface AsignacionConNombre {
  id: string;
  materia_id: string | null;
  carrera_id: string | null;
  cohorte_id: string | null;
  materia_nombre: string | null;
  cohorte_nombre: string | null;
  rol_nombre: string | null;
}

function useMisAsignaciones() {
  const baseQuery = useQuery<AsignacionResponse[]>({
    queryKey: ['equipos', 'mis-equipos'],
    queryFn: () => api.get('/api/equipos/mis-equipos').then(r => r.data),
  });

  const detalleQuery = useQuery<AsignacionDetalleView[]>({
    queryKey: ['equipos', 'mis-equipos-detalle'],
    queryFn: () => api.get('/api/equipos/mis-equipos-detalle').then(r => r.data),
  });

  const combined: AsignacionConNombre[] = (baseQuery.data ?? []).map(a => {
    const detalle = (detalleQuery.data ?? []).find(d => d.asignacion_id === a.id);
    return {
      id: a.id,
      materia_id: a.materia_id ?? null,
      carrera_id: a.carrera_id ?? null,
      cohorte_id: a.cohorte_id ?? null,
      materia_nombre: detalle?.materia_nombre ?? null,
      cohorte_nombre: detalle?.cohorte_nombre ?? null,
      rol_nombre: detalle?.rol_nombre ?? null,
    };
  });

  return {
    isLoading: baseQuery.isLoading || detalleQuery.isLoading,
    asignaciones: combined,
  };
}

export function GuardiasPage() {
  const { isLoading, asignaciones } = useMisAsignaciones();
  const registrar = useRegistrarGuardia();
  const misGuardias = useMisGuardias();

  const [asignacionId, setAsignacionId] = useState('');
  const [dia, setDia] = useState<DiaSemana>('Lunes');
  const [horario, setHorario] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAsignacion = asignaciones.find(a => a.id === asignacionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsignacion?.materia_id) {
      setErrorMsg('La asignación seleccionada no tiene materia asignada.');
      return;
    }
    setSuccessMsg('');
    setErrorMsg('');

    registrar.mutate(
      {
        asignacionId,
        data: {
          materia_id: selectedAsignacion.materia_id,
          carrera_id: selectedAsignacion.carrera_id,
          cohorte_id: selectedAsignacion.cohorte_id,
          dia,
          horario,
          comentarios: comentarios || null,
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg('Guardia registrada correctamente.');
          setHorario('');
          setComentarios('');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Error al registrar la guardia.';
          setErrorMsg(msg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (asignaciones.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-serif text-white/90">Mis Guardias</h1>
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-3 block">security</span>
          <p className="text-white/50 text-sm">No tenés asignaciones activas para asociar a una guardia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Mis Guardias</h1>
        <p className="mt-1 text-sm text-white/70">Registrá los turnos de guardia que cubriste.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-white/90 mb-4">Registrar guardia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Asignación</label>
            <select
              value={asignacionId}
              onChange={e => setAsignacionId(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              <option value="" className="bg-slate-900">— Seleccioná una asignación —</option>
              {asignaciones.map(a => (
                <option key={a.id} value={a.id} className="bg-slate-900">
                  {a.materia_nombre ?? 'Sin materia'} · {a.rol_nombre ?? ''}
                  {a.cohorte_nombre ? ` · ${a.cohorte_nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Día</label>
              <select
                value={dia}
                onChange={e => setDia(e.target.value as DiaSemana)}
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              >
                {DIA_SEMANA_OPTIONS.map(d => (
                  <option key={d} value={d} className="bg-slate-900">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Horario</label>
              <input
                type="text"
                value={horario}
                onChange={e => setHorario(e.target.value)}
                required
                placeholder="ej: 14:00–14:45"
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Comentarios (opcional)</label>
            <textarea
              value={comentarios}
              onChange={e => setComentarios(e.target.value)}
              rows={2}
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {successMsg && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={registrar.isPending || !asignacionId}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {registrar.isPending && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {registrar.isPending ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-black/20">
          <h2 className="text-sm font-medium text-white/90 uppercase tracking-wider">
            Mis guardias
          </h2>
        </div>
        {misGuardias.isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50" />
          </div>
        ) : !misGuardias.data || misGuardias.data.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">Aún no registraste ninguna guardia.</p>
        ) : (
          <table className="w-full text-sm text-white/80">
            <thead className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Día</th>
                <th className="px-4 py-2 text-left">Horario</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {misGuardias.data.map(g => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2">{g.dia}</td>
                  <td className="px-4 py-2">{g.horario}</td>
                  <td className="px-4 py-2">
                    <EstadoBadge estado={g.estado} />
                  </td>
                  <td className="px-4 py-2 text-white/50">{g.comentarios ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
