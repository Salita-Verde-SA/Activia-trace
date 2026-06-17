import api from '@/shared/services/api';
import { PLACEHOLDER_UUID } from '@/shared/constants';
import type {
  PreviewResponse,
  ImportConfirmRequest,
  UmbralCreate,
  UmbralResponse,
  ReporteAtrasadosResponse,
  RankingActividadesResponse,
  SabanaResponse,
  PadronActivoItem
} from '../types';

export const uploadCalificacionesFile = async (file: File): Promise<PreviewResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/calificaciones/importar/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const confirmImportCalificaciones = async (data: ImportConfirmRequest, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('materia_id', data.materia_id);
  formData.append('cohorte_id', data.cohorte_id);
  formData.append('version_padron_id', data.version_padron_id);
  formData.append('columnas_json', JSON.stringify(data.columnas));
  formData.append('es_reporte_finalizacion', String(data.es_reporte_finalizacion ?? false));
  formData.append('file', file);
  const response = await api.post('/api/calificaciones/importar/confirm', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getUmbral = async (materiaId: string): Promise<UmbralResponse | null> => {
  try {
    const response = await api.get(`/api/calificaciones/umbral/${materiaId}`);
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const setUmbral = async (data: UmbralCreate): Promise<UmbralResponse> => {
  const response = await api.put('/api/calificaciones/umbral', data);
  return response.data;
};

export const importarPadronComision = async (materiaId: string, cohorteId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('materia_id', materiaId);
  formData.append('cohorte_id', cohorteId);
  formData.append('file', file);
  await api.post('/api/padron/importar-manual', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPadronesActivos = async (): Promise<PadronActivoItem[]> => {
  const response = await api.get('/api/padron/activos');
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
