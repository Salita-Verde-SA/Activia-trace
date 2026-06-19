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
}

export interface PerfilUpdate {
  nombre?: string;
  apellido?: string;
  dni?: string | null;
  cuil?: string | null;
  cbu?: string | null;
  alias_cbu?: string | null;
}
