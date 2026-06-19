import React from 'react';

interface ComunicacionesFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const ComunicacionesFormatter: React.FC<ComunicacionesFormatterProps> = ({ accion, detalle }) => {
  if (accion === 'PUBLICAR_AVISO') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">campaign</span>
        <span className="text-sm text-alabaster truncate max-w-[200px]" title={detalle.titulo}>{detalle.titulo}</span>
      </div>
    );
  }

  if (accion === 'COMUNICACION_ENVIAR') {
    const short = String(detalle.lote_id ?? '').slice(0, 8);
    const count = detalle.count ?? detalle.aprobadas ?? '?';
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-green-400 text-sm">send</span>
        <span className="text-sm text-white/80">
          Lote <span className="font-mono text-white/50">{short}…</span> — {count} mensaje{count !== 1 ? 's' : ''} aprobado{count !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  if (accion === 'COMUNICACION_CANCELAR') {
    const short = String(detalle.lote_id ?? '').slice(0, 8);
    const count = detalle.count ?? detalle.canceladas ?? '?';
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-red-400 text-sm">cancel</span>
        <span className="text-sm text-white/80">
          Lote <span className="font-mono text-white/50">{short}…</span> — {count} mensaje{count !== 1 ? 's' : ''} cancelado{count !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return null;
};
