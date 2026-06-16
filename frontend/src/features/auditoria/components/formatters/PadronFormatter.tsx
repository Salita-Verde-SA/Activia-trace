import React from 'react';

interface PadronFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const PadronFormatter: React.FC<PadronFormatterProps> = ({ accion, detalle }) => {
  if (accion === 'PADRON_CARGAR') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-green-400 text-sm">group_add</span>
        <span className="text-sm text-alabaster">
          Padrón importado: <span className="font-mono text-xs opacity-70">{detalle.registros || 0} registros</span>
        </span>
      </div>
    );
  }

  if (accion === 'PADRON_VACIAR') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-red-400 text-sm">group_remove</span>
        <span className="text-sm text-alabaster">
          Padrón vaciado: <span className="font-mono text-xs opacity-70">{detalle.versiones_eliminadas || 0} versiones eliminadas</span>
        </span>
      </div>
    );
  }

  if (accion === 'CALIFICACIONES_IMPORTAR') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">grading</span>
        <span className="text-sm text-alabaster">
          Notas importadas: <span className="font-mono text-xs opacity-70">{detalle.calificaciones_creadas || 0} notas</span>
        </span>
      </div>
    );
  }

  return null;
};
