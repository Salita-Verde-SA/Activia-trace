export interface AuditoriaFiltro {
  fecha_desde?: string;
  fecha_hasta?: string;
  actor_id?: string;
  accion?: string;
  materia_id?: string;
  limit?: number;
  offset?: number;
}

export interface AuditoriaRegistro {
  id: string;
  tenant_id: string;
  fecha_hora: string;
  actor_id: string;
  impersonado_id: string | null;
  materia_id: string | null;
  accion: string;
  detalle: Record<string, any> | null;
  filas_afectadas: number;
  ip: string | null;
  user_agent: string | null;
}

export interface AuditoriaRespuesta {
  total: number;
  limit: number;
  offset: number;
  items: AuditoriaRegistro[];
}
