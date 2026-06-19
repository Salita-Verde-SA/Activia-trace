export interface Carrera {
  id: string;
  tenant_id: string;
  codigo: string;
  nombre: string;
  estado: 'Activa' | 'Inactiva';
  created_at: string;
}

export interface Cohorte {
  id: string;
  tenant_id: string;
  carrera_id: string;
  nombre: string;
  anio: number;
  estado: 'Activa' | 'Inactiva';
  created_at: string;
}

export interface Materia {
  id: string;
  tenant_id: string;
  codigo: string;
  nombre: string;
  estado: 'Activa' | 'Inactiva';
  created_at: string;
}

export interface Usuario {
  id: string;
  tenant_id: string;
  email: string;
  nombre: string;
  apellido: string;
  legajo?: string;
  dni?: string;
  cuil?: string;
  cbu?: string;
  alias_cbu?: string;
  created_at: string;
  roles?: string[];
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
