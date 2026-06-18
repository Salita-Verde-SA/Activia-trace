export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
export type EstadoInstancia = 'Programado' | 'Realizado' | 'Cancelado';

export interface InstanciaEncuentro {
  id: string;
  tenant_id: string;
  slot_id: string | null;
  materia_id: string;
  fecha: string;
  hora: string;
  titulo: string;
  estado: EstadoInstancia;
  meet_url: string | null;
  video_url: string | null;
  comentario: string | null;
}

export interface SlotEncuentroCreate {
  materia_id: string;
  titulo: string;
  hora: string;
  dia_semana?: DiaSemana;
  fecha_inicio?: string;
  cant_semanas: number;
  fecha_unica?: string;
  meet_url?: string;
}

export interface InstanciaEncuentroUpdate {
  estado?: EstadoInstancia;
  meet_url?: string;
  video_url?: string;
  comentario?: string;
}

export interface EncuentroRecurrenteResponse {
  slot: {
    id: string;
    asignacion_id: string;
    materia_id: string;
    titulo: string;
    hora: string;
    dia_semana: DiaSemana | null;
    fecha_inicio: string | null;
    cant_semanas: number;
    fecha_unica: string | null;
    meet_url: string | null;
  };
  instancias: InstanciaEncuentro[];
}
