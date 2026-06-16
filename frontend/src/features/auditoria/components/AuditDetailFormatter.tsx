import React from 'react';
import {
  AccesosFormatter,
  TareasFormatter,
  EstructuraFormatter,
  PadronFormatter,
  UsuariosFormatter,
  FinanzasFormatter,
  ComunicacionesFormatter
} from './formatters';

interface AuditDetailFormatterProps {
  accion: string;
  detalle: Record<string, any> | null;
}

export const AuditDetailFormatter: React.FC<AuditDetailFormatterProps> = ({ accion, detalle }) => {
  if (!detalle) return <span className="text-on-surface-variant/50">-</span>;

  // Accesos
  if (['LOGIN', 'CREATE_USER', 'CHANGE_ROLE'].includes(accion)) {
    return <AccesosFormatter accion={accion} detalle={detalle} />;
  }

  // Tareas
  if (accion.startsWith('TAREA_')) {
    return <TareasFormatter accion={accion} detalle={detalle} />;
  }

  // Estructura Académica
  if (accion.startsWith('CARRERA_') || accion.startsWith('MATERIA_') || accion.startsWith('COHORTE_')) {
    return <EstructuraFormatter accion={accion} detalle={detalle} />;
  }

  // Padrón y Calificaciones
  if (accion.startsWith('PADRON_') || accion === 'CALIFICACIONES_IMPORTAR') {
    return <PadronFormatter accion={accion} detalle={detalle} />;
  }

  // Usuarios y Asignaciones
  if (accion === 'PERFIL_MODIFICADO' || accion === 'ASIGNACION_MODIFICAR') {
    return <UsuariosFormatter accion={accion} detalle={detalle} />;
  }

  // Finanzas
  if (accion === 'LIQUIDACION_CERRAR') {
    return <FinanzasFormatter accion={accion} detalle={detalle} />;
  }

  // Comunicaciones
  if (accion === 'PUBLICAR_AVISO') {
    return <ComunicacionesFormatter accion={accion} detalle={detalle} />;
  }

  // Default fallback for unknown actions
  return (
    <span className="text-xs font-mono text-on-surface-variant truncate max-w-[250px] inline-block" title={JSON.stringify(detalle)}>
      {JSON.stringify(detalle).substring(0, 40)}{JSON.stringify(detalle).length > 40 ? '...' : ''}
    </span>
  );
};
