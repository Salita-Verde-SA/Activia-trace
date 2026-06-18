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
  
  create: (data: FormData) => 
    api.post<Factura>('/api/v1/facturas', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

  abonar: (id: string) =>
    api.put<Factura>(`/api/v1/facturas/${id}/abonar`).then(res => res.data),

  descargar: async (id: string, mes: number, anio: number) => {
    const response = await api.get(`/api/v1/facturas/${id}/archivo`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factura_${anio}_${mes}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};
