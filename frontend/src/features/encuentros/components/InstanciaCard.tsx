import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InstanciaEncuentro } from '../types';
import { encuentrosApi } from '../services/encuentrosApi';

interface InstanciaCardProps {
  instancia: InstanciaEncuentro;
  queryKey: unknown[];
  readonly?: boolean;
}

const estadoBadge = {
  Programado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Realizado: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelado: 'bg-white/5 text-white/30 border-white/10',
};

export function InstanciaCard({ instancia, queryKey, readonly = false }: InstanciaCardProps) {
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
    year: 'numeric',
  });
  const hora = instancia.hora.substring(0, 5);
  const cancelado = instancia.estado === 'Cancelado';

  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3 ${cancelado ? 'opacity-50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-sm font-semibold text-white/90 ${cancelado ? 'line-through' : ''}`}>
            {instancia.titulo}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${estadoBadge[instancia.estado]}`}
          >
            {instancia.estado}
          </span>
        </div>
        <p className="text-xs text-white/50">
          {fecha} · {hora}
        </p>
        {instancia.meet_url && (
          <a
            href={instancia.meet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 hover:text-primary-300 mt-1 inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">video_call</span>
            Unirse al encuentro
          </a>
        )}
      </div>

      {!readonly && instancia.estado === 'Programado' && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => mutation.mutate('Realizado')}
            disabled={mutation.isPending}
            title="Marcar como Realizado"
            className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-40"
          >
            Realizado
          </button>
          <button
            onClick={() => mutation.mutate('Cancelado')}
            disabled={mutation.isPending}
            title="Cancelar instancia"
            className="text-xs px-2 py-1 bg-white/5 border border-white/10 text-white/50 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
