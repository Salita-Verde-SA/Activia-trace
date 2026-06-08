import api from '@/shared/services/api';
import type { 
  PreviewResponse, 
  ImportConfirmRequest, 
  UmbralCreate, 
  UmbralResponse,
  ReporteAtrasadosResponse,
  RankingActividadesResponse,
  SabanaResponse
} from '../types';

export const uploadCalificacionesFile = async (file: File): Promise<PreviewResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/calificaciones/import/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const confirmImportCalificaciones = async (data: ImportConfirmRequest): Promise<any> => {
  const response = await api.post('/api/calificaciones/import/confirm', data);
  return response.data;
};

export const getUmbral = async (materiaId: string): Promise<UmbralResponse> => {
  const response = await api.get(`/api/calificaciones/umbral/${materiaId}`);
  return response.data;
};

export const setUmbral = async (data: UmbralCreate): Promise<UmbralResponse> => {
  const response = await api.post('/api/calificaciones/umbral', data);
  return response.data;
};

export const getAtrasados = async (materiaId: string): Promise<ReporteAtrasadosResponse> => {
  const response = await api.get(`/api/analisis/atrasados/${materiaId}`);
  return response.data;
};

export const getRanking = async (materiaId: string): Promise<RankingActividadesResponse> => {
  const response = await api.get(`/api/analisis/ranking/${materiaId}`);
  return response.data;
};

export const getSabana = async (materiaId: string): Promise<SabanaResponse> => {
  const response = await api.get(`/api/analisis/sabana/${materiaId}`);
  return response.data;
};
