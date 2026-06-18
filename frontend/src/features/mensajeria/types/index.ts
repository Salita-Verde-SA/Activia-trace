export interface UsuarioMensajeria {
  id: string;
  nombre: string;
  apellido: string;
}

export interface MensajeInternoResponse {
  id: string;
  hilo_id: string;
  emisor_id: string | null;
  leido: boolean;
  contenido: string;
  created_at: string;
}

export interface ParticipanteResponse {
  id: string;
  username: string;
  email_hash?: string;
}

export interface HiloResponse {
  id: string;
  asunto: string | null;
  creado_por_id: string | null;
  created_at: string;
  updated_at: string;
  participantes: ParticipanteResponse[];
  mensajes: MensajeInternoResponse[];
}

export interface HiloListResponse {
  id: string;
  asunto: string | null;
  created_at: string;
  updated_at: string;
  ultimo_mensaje: string | null;
  no_leidos_count: number;
}

export interface HiloCreate {
  asunto?: string;
  mensaje_inicial: string;
  destinatarios_ids: string[];
}

export interface MensajeInternoCreate {
  contenido: string;
}
