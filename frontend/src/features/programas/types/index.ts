export interface ProgramaMateria {
  id: string;
  materia_id: string;
  carrera_id?: string;
  cohorte_id?: string;
  referencia_archivo: string;
  version?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramaMateriaCreate {
  materia_id: string;
  carrera_id?: string;
  cohorte_id?: string;
  referencia_archivo: string;
  version?: string;
}

export interface ProgramaMateriaUpdate extends Partial<ProgramaMateriaCreate> {}

export enum TipoFechaAcademica {
  PARCIAL = "Parcial",
  RECUPERATORIO = "Recuperatorio",
  TP = "Trabajo Practico",
  COLOQUIO = "Coloquio",
  FINAL = "Final",
  OTRO = "Otro",
}

export interface FechaAcademica {
  id: string;
  materia_id: string;
  cohorte_id?: string;
  tipo: TipoFechaAcademica;
  fecha: string;
  titulo?: string;
  descripcion?: string;
  es_feriado: boolean;
  created_at: string;
  updated_at: string;
}

export interface FechaAcademicaCreate {
  materia_id: string;
  cohorte_id?: string;
  tipo: TipoFechaAcademica;
  fecha: string;
  titulo?: string;
  descripcion?: string;
  es_feriado?: boolean;
}

export interface FechaAcademicaUpdate extends Partial<FechaAcademicaCreate> {}
