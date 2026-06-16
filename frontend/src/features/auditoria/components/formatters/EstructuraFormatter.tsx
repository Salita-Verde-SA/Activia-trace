import React from 'react';

interface EstructuraFormatterProps {
  accion: string;
  detalle: Record<string, any>;
}

export const EstructuraFormatter: React.FC<EstructuraFormatterProps> = ({ accion, detalle }) => {
  // Ejemplos: CARRERA_CREAR, MATERIA_MODIFICAR, COHORTE_ELIMINAR
  const partes = accion.split('_');
  const entidad = partes[0]; // CARRERA, MATERIA, COHORTE
  const operacion = partes[1]; // CREAR, MODIFICAR, ELIMINAR

  const getOperacionTexto = () => {
    if (operacion === 'CREAR') return 'creada';
    if (operacion === 'MODIFICAR') return 'modificada';
    if (operacion === 'ELIMINAR') return 'eliminada';
    return operacion.toLowerCase();
  };

  const idCorto = detalle.id ? detalle.id.substring(0, 8) : 'N/A';
  const entidadCapitalized = entidad.charAt(0) + entidad.slice(1).toLowerCase();
  const texto = `${entidadCapitalized} ${getOperacionTexto()}`;

  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-sm">school</span>
      <span className="text-sm text-alabaster">
        {texto} <span className="font-mono text-xs opacity-70">({idCorto})</span>
      </span>
    </div>
  );
};
