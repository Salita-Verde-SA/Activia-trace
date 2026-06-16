import React from 'react';

interface FinanzasFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const FinanzasFormatter: React.FC<FinanzasFormatterProps> = ({ accion, detalle }) => {
  if (accion === 'LIQUIDACION_CERRAR') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-green-400 text-sm">account_balance</span>
        <span className="text-sm text-alabaster">
          Liquidación cerrada <span className="font-mono text-xs opacity-70">({detalle.periodo || 'N/A'})</span>
        </span>
      </div>
    );
  }

  return null;
};
