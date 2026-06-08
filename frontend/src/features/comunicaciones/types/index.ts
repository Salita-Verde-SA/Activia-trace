export type EstadoComunicacion = 'Pendiente' | 'Enviando' | 'Enviado' | 'Error' | 'Cancelado';

export interface ComunicacionCreate {
  destinatario: string;
  asunto: string;
  cuerpo: string;
}

export interface LoteCreate {
  comunicaciones: ComunicacionCreate[];
}

export interface ComunicacionResponse {
  id: string;
  lote_id: string;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  estado: EstadoComunicacion;
  fecha_envio?: string;
  error_msg?: string;
}

export interface LoteResponse {
  lote_id: string;
  comunicaciones: ComunicacionResponse[];
}
