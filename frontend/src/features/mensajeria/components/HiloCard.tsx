import type { HiloListResponse } from '../types';

interface HiloCardProps {
  hilo: HiloListResponse;
  onClick: () => void;
}

export function HiloCard({ hilo, onClick }: HiloCardProps) {
  const fecha = new Date(hilo.updated_at).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors flex items-start gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-white/90 truncate">
            {hilo.asunto ?? 'Sin asunto'}
          </span>
          <span className="text-xs text-white/40 shrink-0">{fecha}</span>
        </div>
        {hilo.ultimo_mensaje && (
          <p className="text-xs text-white/50 truncate">{hilo.ultimo_mensaje}</p>
        )}
      </div>
      {hilo.no_leidos_count > 0 && (
        <span className="shrink-0 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
          {hilo.no_leidos_count > 9 ? '9+' : hilo.no_leidos_count}
        </span>
      )}
    </button>
  );
}
