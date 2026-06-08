import api from '@/shared/services/api';
import { LoteCreate, LoteResponse, ComunicacionResponse } from '../types';

export const createLote = async (data: LoteCreate): Promise<LoteResponse> => {
  const response = await api.post('/api/comunicaciones/lote', data);
  return response.data;
};

export const getLoteStatus = async (loteId: string): Promise<LoteResponse> => {
  const response = await api.get(`/api/comunicaciones/lote/${loteId}`);
  return response.data;
};

export const getComunicacionStatus = async (id: string): Promise<ComunicacionResponse> => {
  const response = await api.get(`/api/comunicaciones/${id}`);
  return response.data;
};

export const cancelComunicacion = async (id: string): Promise<ComunicacionResponse> => {
  const response = await api.post(`/api/comunicaciones/${id}/cancel`);
  return response.data;
};
