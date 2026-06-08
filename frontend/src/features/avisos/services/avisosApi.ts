import api from '@/shared/services/api';
import type {
  AvisoResponse,
  AvisoCreate,
  AvisoAcknowledgmentCreate,
  AvisoMetrics,
} from '../types';

export const avisosApi = {
  getAvisos: async (): Promise<AvisoResponse[]> => {
    const { data } = await api.get('/api/v1/avisos');
    return data;
  },

  getAviso: async (id: string): Promise<AvisoResponse> => {
    const { data } = await api.get(`/api/v1/avisos/${id}`);
    return data;
  },

  crearAviso: async (payload: AvisoCreate): Promise<AvisoResponse> => {
    const { data } = await api.post('/api/v1/avisos', payload);
    return data;
  },

  darAcuse: async (payload: AvisoAcknowledgmentCreate): Promise<void> => {
    await api.post('/api/v1/avisos/ack', payload);
  },

  getAvisoMetrics: async (id: string): Promise<AvisoMetrics> => {
    const { data } = await api.get(`/api/v1/avisos/${id}/metrics`);
    return data;
  },
};
