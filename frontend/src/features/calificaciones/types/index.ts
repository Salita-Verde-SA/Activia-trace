export interface ColumnMap {
  nombre_columna: string;
  es_numerica: boolean;
  ignorar?: boolean;
}

export interface PreviewResponse {
  columnas_detectadas: ColumnMap[];
  total_filas: number;
  preview_data: Record<string, any>[];
}

export interface ImportConfirmRequest {
  materia_id: string;
  cohorte_id: string;
  version_padron_id: string;
  columnas: ColumnMap[];
  es_reporte_finalizacion?: boolean;
}

export interface UmbralBase {
  materia_id: string;
  docente_id?: string;
  umbral_pct: number;
  valores_aprobatorios: string[];
}

export interface UmbralCreate extends UmbralBase {}

export interface UmbralResponse extends UmbralBase {
  id: string;
}

export interface CalificacionSimplificada {
  actividad_nombre: string;
  nota_numerica?: number;
  nota_textual?: string;
  aprobado: boolean;
}

export interface AlumnoAtrasado {
  entrada_padron_id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  actividades_no_aprobadas: CalificacionSimplificada[];
}

export interface ReporteAtrasadosResponse {
  materia_id: string;
  total_alumnos_padron: number;
  total_alumnos_atrasados: number;
  alumnos_atrasados: AlumnoAtrasado[];
}

export interface ActividadRanking {
  actividad_nombre: string;
  total_evaluados: number;
  total_aprobados: number;
  porcentaje_aprobacion: number;
}

export interface RankingActividadesResponse {
  materia_id: string;
  actividades: ActividadRanking[];
}

export interface SabanaAlumno {
  entrada_padron_id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  calificaciones: Record<string, CalificacionSimplificada>;
}

export interface SabanaResponse {
  materia_id: string;
  actividades_headers: string[];
  alumnos: SabanaAlumno[];
}
