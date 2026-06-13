export enum SeveridadAviso {
  INFO = 'INFO',
  WARNING = 'WARNING',
  URGENT = 'CRITICAL',
}

export enum AlcanceAviso {
  GLOBAL = 'GLOBAL',
  CARRERA = 'CARRERA',
  COHORTE = 'COHORTE',
  MATERIA = 'MATERIA',
  DOCENTES = 'DOCENTES',
  ALUMNOS = 'ALUMNOS',
}

export interface AvisoBase {
  titulo: string;
  cuerpo: string;
  severidad?: SeveridadAviso;
  fecha_inicio: string;
  fecha_fin?: string;
  requiere_ack?: boolean;
  alcance: AlcanceAviso;
  materia_id?: string;
  cohorte_id?: string;
  rol_id?: string;
}

export interface AvisoCreate extends AvisoBase {}

export interface AvisoResponse extends AvisoBase {
  id: string;
  tenant_id: string;
}

export interface AvisoAcknowledgmentCreate {
  aviso_id: string;
}

export interface AvisoMetrics {
  aviso_id: string;
  alcance_total: number;
  leidos_count: number;
  pendientes_count: number;
  porcentaje_leidos: number;
}
