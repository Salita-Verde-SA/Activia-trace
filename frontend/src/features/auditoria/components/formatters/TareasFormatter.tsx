import React from 'react';

interface TareasFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const TareasFormatter: React.FC<TareasFormatterProps> = ({ accion, detalle }) => {
  switch (accion) {
    case 'TAREA_CREATED':
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">add_task</span>
            <span className="text-sm text-alabaster truncate max-w-[200px]" title={detalle.titulo}>{detalle.titulo}</span>
          </div>
        </div>
      );
    case 'TAREA_STATUS_UPDATED':
      return (
        <div className="flex items-center gap-2 text-sm font-label-caps uppercase tracking-wider text-[10px]">
          <span className="text-on-surface-variant border border-white/5 bg-white/5 px-2 py-0.5 rounded">{detalle.old_status}</span>
          <span className="material-symbols-outlined text-primary text-sm">arrow_right_alt</span>
          <span className="text-alabaster border border-primary/30 bg-primary/10 px-2 py-0.5 rounded">{detalle.new_status}</span>
        </div>
      );
    case 'TAREA_ASSIGNED':
      return (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">person_search</span>
          <span className="text-sm text-alabaster">Asignado a <span className="font-mono text-xs opacity-70">{detalle.assignee_id?.substring(0, 8)}...</span></span>
        </div>
      );
    case 'TAREA_COMMENTED':
      return (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm opacity-70">forum</span>
          <span className="text-sm text-on-surface-variant italic truncate max-w-[200px]">"{detalle.texto}"</span>
        </div>
      );
    default:
      return null;
  }
};
