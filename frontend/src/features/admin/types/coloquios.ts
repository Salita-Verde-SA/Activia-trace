export interface TurnoColoquio {
  id: string;
  convocatoria_id: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  cupo_maximo: number;
  cupos_ocupados: number;
  estado: string;
}

export interface TurnoColoquioCreate {
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  cupo_maximo: number;
}

export interface ConvocatoriaColoquio {
  id: string;
  materia_id: string;
  nombre: string;
  descripcion?: string;
  fecha_apertura_reservas?: string;
  fecha_cierre_reservas?: string;
  estado: string;
  turnos?: TurnoColoquio[];
  // Auxiliares
  materia_nombre?: string;
}

export interface ConvocatoriaColoquioCreate {
  materia_id: string;
  nombre: string;
  descripcion?: string;
  fecha_apertura_reservas?: string;
  fecha_cierre_reservas?: string;
  turnos: TurnoColoquioCreate[];
}

export interface CandidatoColoquio {
  usuario_id: string;
  nombre_completo: string;
  email: string;
  habilitado: boolean;
}

export interface AsignarCandidatosRequest {
  alumnos_ids: string[];
}
