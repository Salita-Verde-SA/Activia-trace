import api from '@/shared/services/api';
import type { Liquidacion } from '../types';

export const liquidacionesApi = {
  getAll: (params?: { periodo_anio?: number; periodo_mes?: number; estado?: string }) => 
    api.get<Liquidacion[]>('/api/v1/liquidaciones', { params }).then(res => res.data),
  
  getById: (id: string) => 
    api.get<Liquidacion>(`/api/v1/liquidaciones/${id}`).then(res => res.data),
  
  cerrar: (id: string) => 
    api.post<Liquidacion>(`/api/v1/liquidaciones/${id}/cerrar`).then(res => res.data),
};
