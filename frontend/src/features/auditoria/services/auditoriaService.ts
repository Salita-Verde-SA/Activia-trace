import api from '@/shared/services/api';
import type { AuditoriaFiltro, AuditoriaRespuesta } from '../types';

export const auditoriaService = {
  async explorarLogs(filtro: AuditoriaFiltro): Promise<AuditoriaRespuesta> {
    const params = new URLSearchParams();
    
    if (filtro.fecha_desde) params.append('fecha_desde', filtro.fecha_desde);
    if (filtro.fecha_hasta) params.append('fecha_hasta', filtro.fecha_hasta);
    if (filtro.actor_id) params.append('actor_id', filtro.actor_id);
    if (filtro.accion) params.append('accion', filtro.accion);
    if (filtro.materia_id) params.append('materia_id', filtro.materia_id);
    if (filtro.limit !== undefined) params.append('limit', filtro.limit.toString());
    if (filtro.offset !== undefined) params.append('offset', filtro.offset.toString());

    // Clean up empty params
    const queryString = params.toString();
    const url = queryString ? `/api/v1/auditoria/explorar?${queryString}` : '/api/v1/auditoria/explorar';
    
    const response = await api.get<AuditoriaRespuesta>(url);
    return response.data;
  },

  async obtenerUltimas(): Promise<AuditoriaRespuesta> {
    const response = await api.get<AuditoriaRespuesta>('/api/v1/auditoria/ultimas');
    return response.data;
  }
};
