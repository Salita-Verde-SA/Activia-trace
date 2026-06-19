export interface PerfilData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  cuil: string | null;
  cbu: string | null;
  alias_cbu: string | null;
  legajo: string | null;
  activo: boolean;
  totp_enabled: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  banco: string | null;
  regional: string | null;
  genero: string | null;
  es_monotributista: boolean | null;
  identificador_profesional: string | null;
}

export interface PerfilUpdate {
  nombre?: string;
  apellido?: string;
  dni?: string | null;
  cuil?: string | null;
  cbu?: string | null;
  alias_cbu?: string | null;
  banco?: string | null;
  regional?: string | null;
  genero?: string | null;
  es_monotributista?: boolean | null;
  identificador_profesional?: string | null;
}
