import api from '@/shared/services/api';
import { PLACEHOLDER_UUID } from '@/shared/constants';
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
  const response = await api.put('/api/calificaciones/umbral', data);
  return response.data;
};

export const getAtrasados = async (materiaId: string): Promise<ReporteAtrasadosResponse> => {
  if (materiaId === PLACEHOLDER_UUID) {
    return { materia_id: materiaId, total_alumnos_padron: 0, total_alumnos_atrasados: 0, alumnos_atrasados: [] } as unknown as ReporteAtrasadosResponse;
  }
  const response = await api.get(`/api/analisis/materias/${materiaId}/atrasados`);
  return response.data;
};

export const getRanking = async (materiaId: string): Promise<RankingActividadesResponse> => {
  if (materiaId === PLACEHOLDER_UUID) {
    return { materia_id: materiaId, actividades: [] } as unknown as RankingActividadesResponse;
  }
  const response = await api.get(`/api/analisis/materias/${materiaId}/ranking`);
  return response.data;
};

export const getSabana = async (materiaId: string): Promise<SabanaResponse> => {
  if (materiaId === PLACEHOLDER_UUID) {
    return { materia_id: materiaId, actividades_headers: [], alumnos: [] } as unknown as SabanaResponse;
  }
  const response = await api.get(`/api/analisis/materias/${materiaId}/sabana`);
  return response.data;
};
