import api from '@/shared/services/api';
import type { LoteCreate, ComunicacionResponse } from '../types';

export const createLote = async (data: LoteCreate): Promise<string> => {
  const response = await api.post('/api/comunicaciones/lotes', data);
  return response.data;
};

export const getLoteStatus = async (loteId: string): Promise<ComunicacionResponse[]> => {
  const response = await api.get(`/api/comunicaciones/lotes/${loteId}/preview`);
  return response.data;
};
