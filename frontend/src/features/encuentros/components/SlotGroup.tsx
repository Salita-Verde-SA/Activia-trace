import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InstanciaEncuentro, EstadoInstancia } from '../types';
import { encuentrosApi } from '../services/encuentrosApi';

const estadoBadge: Record<EstadoInstancia, string> = {
  Programado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Realizado: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelado: 'bg-white/5 text-white/30 border-white/10',
};

interface SlotGroupProps {
  instancias: InstanciaEncuentro[];
  queryKey: unknown[];
  readonly?: boolean;
}

function InstanciaRow({
  instancia,
  queryKey,
  readonly,
}: {
  instancia: InstanciaEncuentro;
  queryKey: unknown[];
  readonly?: boolean;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (estado: 'Realizado' | 'Cancelado') =>
      encuentrosApi.editarInstancia(instancia.id, { estado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const fecha = new Date(instancia.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const hora = instancia.hora.substring(0, 5);
  const cancelado = instancia.estado === 'Cancelado';

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
        cancelado ? 'opacity-40' : 'hover:bg-white/5'
      }`}
    >
      <span className="text-white/50 w-32 shrink-0">{fecha} · {hora}</span>
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${estadoBadge[instancia.estado]}`}
      >
        {instancia.estado}
      </span>
      {instancia.meet_url && (
        <a
          href={instancia.meet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-0.5 ml-auto"
        >
          <span className="material-symbols-outlined text-sm">video_call</span>
        </a>
      )}
      {!readonly && instancia.estado === 'Programado' && (
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => mutation.mutate('Realizado')}
            disabled={mutation.isPending}
            className="text-[10px] px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-40"
          >
            Realizado
          </button>
          <button
            onClick={() => mutation.mutate('Cancelado')}
            disabled={mutation.isPending}
            className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-white/40 rounded hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export function SlotGroup({ instancias, queryKey, readonly = false }: SlotGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const first = instancias[0];

  const programadas = instancias.filter(i => i.estado === 'Programado').length;
  const realizadas = instancias.filter(i => i.estado === 'Realizado').length;
  const canceladas = instancias.filter(i => i.estado === 'Cancelado').length;

  const fechaInicio = new Date(instancias[0].fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const fechaFin = new Date(instancias[instancias.length - 1].fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header del grupo */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left"
      >
        <span className="material-symbols-outlined text-white/30 text-lg">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-white/90">{first.titulo}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/40">{instancias.length} clases</span>
          </div>
          <p className="text-xs text-white/40">
            {first.hora.substring(0, 5)} · {fechaInicio} → {fechaFin}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 text-xs">
          {programadas > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {programadas} prog.
            </span>
          )}
          {realizadas > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              {realizadas} real.
            </span>
          )}
          {canceladas > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
              {canceladas} canc.
            </span>
          )}
        </div>
      </button>

      {/* Lista de instancias expandida */}
      {expanded && (
        <div className="border-t border-white/10 px-3 py-2 space-y-0.5">
          {instancias.map(inst => (
            <InstanciaRow
              key={inst.id}
              instancia={inst}
              queryKey={queryKey}
              readonly={readonly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
