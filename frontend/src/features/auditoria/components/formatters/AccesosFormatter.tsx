import React from 'react';

interface AccesosFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const AccesosFormatter: React.FC<AccesosFormatterProps> = ({ accion, detalle }) => {
  switch (accion) {
    case 'LOGIN':
      return (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${detalle.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-sm text-alabaster">
            Inicio {detalle.status === 'success' ? 'exitoso' : 'fallido'}
          </span>
        </div>
      );
    case 'CREATE_USER':
      return (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">person_add</span>
          <span className="text-sm text-alabaster">{detalle.email}</span>
        </div>
      );
    case 'CHANGE_ROLE':
      return (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">key</span>
          <span className="text-sm text-alabaster flex items-center gap-1">Nuevo rol: <span className="font-label-caps text-[10px] border border-white/10 px-1.5 py-0.5 rounded uppercase">{detalle.role}</span></span>
        </div>
      );
    default:
      return null;
  }
};
