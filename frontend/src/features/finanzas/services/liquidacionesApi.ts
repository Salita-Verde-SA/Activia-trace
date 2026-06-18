import api from '@/shared/services/api';
import type { Liquidacion } from '../types';

export const liquidacionesApi = {
  getAll: (params?: { periodo_anio?: number; periodo_mes?: number; estado?: string }) =>
    api.get<Liquidacion[]>('/api/v1/liquidaciones', { params }).then(res => res.data),

  getById: (id: string) =>
    api.get<Liquidacion>(`/api/v1/liquidaciones/${id}`).then(res => res.data),

  cerrar: (id: string) =>
    api.post<Liquidacion>(`/api/v1/liquidaciones/${id}/cerrar`).then(res => res.data),

  cerrarLiquidacion: async (usuarioId: string, params: { mes: number; anio: number }): Promise<Liquidacion> => {
    const { data } = await api.post(`/api/v1/liquidaciones/${usuarioId}/cerrar`, null, { params });
    return data;
  },

  cerrarPeriodo: async (params: { mes: number; anio: number }): Promise<Liquidacion[]> => {
    const { data } = await api.post(`/api/v1/liquidaciones/cerrar-periodo`, null, { params });
    return data;
  },

  exportar: async (mes: number, anio: number) => {
    const response = await api.get('/api/v1/liquidaciones/exportar', {
      params: { mes, anio },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `liquidaciones_${anio}_${mes}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};
