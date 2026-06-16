import React from 'react';

interface ComunicacionesFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const ComunicacionesFormatter: React.FC<ComunicacionesFormatterProps> = ({ accion, detalle }) => {
  if (accion === 'PUBLICAR_AVISO') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">campaign</span>
          <span className="text-sm text-alabaster truncate max-w-[200px]" title={detalle.titulo}>{detalle.titulo}</span>
        </div>
      </div>
    );
  }

  return null;
};
