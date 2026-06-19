export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export type EstadoGuardia = 'Pendiente' | 'Realizada' | 'Cancelada';

export interface GuardiaCreate {
  materia_id: string;
  carrera_id?: string | null;
  cohorte_id?: string | null;
  dia: DiaSemana;
  horario: string;
  comentarios?: string | null;
}

export interface GuardiaResponse {
  id: string;
  tenant_id: string;
  asignacion_id: string;
  materia_id: string;
  carrera_id: string | null;
  cohorte_id: string | null;
  dia: DiaSemana;
  horario: string;
  estado: EstadoGuardia;
  comentarios: string | null;
  creada_at: string;
}

export const DIA_SEMANA_OPTIONS: DiaSemana[] = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];
