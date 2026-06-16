import React from 'react';

interface UsuariosFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const UsuariosFormatter: React.FC<UsuariosFormatterProps> = ({ accion, detalle }) => {
  if (accion === 'PERFIL_MODIFICADO') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">person</span>
        <span className="text-sm text-alabaster">Perfil actualizado</span>
      </div>
    );
  }

  if (accion === 'ASIGNACION_MODIFICAR') {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">group_add</span>
        <span className="text-sm text-alabaster">
          Docentes modificados en <span className="font-mono text-xs opacity-70">{detalle.materia_id?.substring(0, 8)}</span>
        </span>
      </div>
    );
  }

  return null;
};
