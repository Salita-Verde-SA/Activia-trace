export interface AvisoAlumno {
  id: string;
  aviso_id: string;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  requiere_ack: boolean;
  ack_at: string | null;
}

export interface ColoquioDisponible {
  turno_id: string;
  convocatoria_id: string;
  materia_id: string;
  materia_nombre: string;
  nombre_convocatoria: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  cupo_total: number;
  cupo_disponible: number;
  mi_reserva_id: string | null;
}

export interface CalificacionSimplificada {
  actividad_nombre: string;
  nota_numerica: number | null;
  nota_textual: string | null;
  aprobado: boolean;
}

export interface EstadoMateria {
  materia_id: string;
  materia_nombre: string;
  estado: string;
  nota_final: number | null;
  calificaciones: CalificacionSimplificada[];
}
