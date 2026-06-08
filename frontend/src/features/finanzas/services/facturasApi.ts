import { api } from '@/shared/services/api';
import { Factura } from '../types';

export const facturasApi = {
  getAll: (params?: { periodo_anio?: number; periodo_mes?: number }) => 
    api.get<Factura[]>('/api/facturas', { params }).then(res => res.data),
  
  create: (data: Partial<Factura>) => 
    api.post<Factura>('/api/facturas', data).then(res => res.data),
};
