import api from '@/shared/services/api';
import type { Factura } from '../types';

export const facturasApi = {
  getAll: (params?: { periodo_anio?: number; periodo_mes?: number }) => {
    const queryParams = { 
      anio: params?.periodo_anio, 
      mes: params?.periodo_mes 
    };
    return api.get<Factura[]>('/api/v1/facturas', { params: queryParams }).then(res => res.data);
  },
  
  create: (data: Partial<Factura>) => 
    api.post<Factura>('/api/v1/facturas', data).then(res => res.data),
};
