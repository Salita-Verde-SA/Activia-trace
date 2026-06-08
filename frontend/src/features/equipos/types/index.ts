export interface AsignacionBase {
  usuario_id: string;
  rol_id: string;
  materia_id?: string;
  carrera_id?: string;
  cohorte_id?: string;
  responsable_id?: string;
  desde: string;
  hasta?: string;
}

export interface AsignacionResponse extends AsignacionBase {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocenteAsignacionInput {
  usuario_id: string;
  rol_id: string;
  responsable_id?: string;
}

export interface AsignacionMasivaCreate {
  docentes: DocenteAsignacionInput[];
  materia_id?: string;
  carrera_id?: string;
  cohorte_id?: string;
  desde: string;
  hasta?: string;
}

export interface EquipoDocenteView {
  asignacion_id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_email_hash?: string;
  rol_id: string;
  rol_nombre: string;
  materia_id?: string;
  carrera_id?: string;
  cohorte_id?: string;
  desde: string;
  hasta?: string;
}

export interface ClonadoEquipoRequest {
  materia_id?: string;
  carrera_id?: string;
  cohorte_id_origen: string;
  cohorte_id_destino: string;
  nuevo_desde: string;
  nuevo_hasta?: string;
}

export interface AsignacionVigenciaUpdate {
  asignacion_ids: string[];
  nuevo_desde?: string;
  nuevo_hasta?: string;
}
