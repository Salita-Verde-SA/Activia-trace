export enum PrioridadTarea {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum EstadoTarea {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ComentarioTareaBase {
  texto: string;
}

export interface ComentarioTareaCreate extends ComentarioTareaBase {}

export interface ComentarioTareaResponse extends ComentarioTareaBase {
  id: string;
  tarea_id: string;
  usuario_id: string;
  fecha_hora: string;
}

export interface TareaBase {
  titulo: string;
  descripcion?: string;
  prioridad?: PrioridadTarea;
  asignado_a: string;
  contexto_id?: string;
}

export interface TareaCreate extends TareaBase {}

export interface TareaResponse extends TareaBase {
  id: string;
  tenant_id: string;
  estado: EstadoTarea;
  asignado_por: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  comentarios: ComentarioTareaResponse[];
}

export interface TareaUpdateEstado {
  estado: EstadoTarea;
  comentario?: string;
}
