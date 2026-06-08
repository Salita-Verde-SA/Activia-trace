export interface Carrera {
  id: string;
  tenant_id: string;
  codigo: string;
  nombre: string;
  activa: boolean;
  created_at: string;
}

export interface Cohorte {
  id: string;
  tenant_id: string;
  carrera_id: string;
  nombre: string;
  anio: number;
  activa: boolean;
  created_at: string;
}

export interface Materia {
  id: string;
  tenant_id: string;
  codigo: string;
  nombre: string;
  created_at: string;
}

export interface Usuario {
  id: string;
  tenant_id: string;
  email: string;
  nombre: string;
  apellido: string;
  legajo?: string;
  created_at: string;
  roles?: string[]; // from Asignaciones
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  actor_id: string;
  impersonado_id?: string;
  materia_id?: string;
  accion: string;
  detalle: Record<string, any>;
  filas_afectadas?: number;
  ip?: string;
  user_agent?: string;
  fecha_hora: string;
}
