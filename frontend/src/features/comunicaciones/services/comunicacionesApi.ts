import api from '@/shared/services/api';
import type { LoteCreate, ComunicacionResponse, LoteResumen } from '../types';

export const createLote = async (data: LoteCreate): Promise<string> => {
  const response = await api.post('/api/comunicaciones/lotes', data);
  return response.data;
};

export const getLoteStatus = async (loteId: string): Promise<ComunicacionResponse[]> => {
  const response = await api.get(`/api/comunicaciones/lotes/${loteId}/preview`);
  return response.data;
};

export const listarLotes = async (soloPendientes = true): Promise<LoteResumen[]> => {
  const response = await api.get('/api/comunicaciones/lotes', {
    params: { solo_pendientes: soloPendientes },
  });
  return response.data;
};

export const aprobarLote = async (loteId: string): Promise<void> => {
  await api.post(`/api/comunicaciones/lotes/${loteId}/aprobar`);
};

export const cancelarLote = async (loteId: string): Promise<void> => {
  await api.post(`/api/comunicaciones/lotes/${loteId}/cancelar`);
};

export const previewLote = async (loteId: string): Promise<ComunicacionResponse[]> => {
  const response = await api.get(`/api/comunicaciones/lotes/${loteId}/preview`);
  return response.data;
};
