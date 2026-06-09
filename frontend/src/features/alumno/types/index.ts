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
  id: string;
  materia_id: string;
  materia_nombre: string;
  fecha: string;
  cupo_total: number;
  cupo_disponible: number;
}

export interface EstadoMateria {
  materia_id: string;
  materia_nombre: string;
  estado: string;
  nota_final: number | null;
}
