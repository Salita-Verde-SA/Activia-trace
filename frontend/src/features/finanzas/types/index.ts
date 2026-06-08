export interface Liquidacion {
  id: string;
  tenant_id: string;
  usuario_id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_base: number;
  monto_plus: number;
  monto_total: number;
  es_nexo: boolean;
  excluido_por_factura: boolean;
  estado: 'ABIERTA' | 'CERRADA';
  fecha_cierre?: string;
  created_at: string;
  updated_at: string;
}

export interface SalarioBase {
  id: string;
  tenant_id: string;
  rol: string;
  monto: number;
  vigente_desde: string;
  vigente_hasta?: string;
}

export interface SalarioPlus {
  id: string;
  tenant_id: string;
  grupo_nombre: string;
  rol: string;
  monto: number;
  vigente_desde: string;
  vigente_hasta?: string;
}

export interface Factura {
  id: string;
  tenant_id: string;
  usuario_id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  archivo_url?: string;
  created_at: string;
}
