import api from '@/shared/services/api';
import type { ConvocatoriaColoquio, ConvocatoriaColoquioCreate, AsignarCandidatosRequest } from '../types/coloquios';

// 1.2 Listar convocatorias
export const listarConvocatoriasAdmin = async (): Promise<ConvocatoriaColoquio[]> => {
  const { data } = await api.get('/api/v1/coloquios/convocatorias');
  return data;
};

// 1.3 Crear convocatoria
export const crearConvocatoria = async (convocatoria: ConvocatoriaColoquioCreate): Promise<ConvocatoriaColoquio> => {
  const { data } = await api.post('/api/v1/coloquios/convocatorias', convocatoria);
  return data;
};

// 1.4 Asignar padrón
export const asignarPadronColoquio = async (convocatoriaId: string, req: AsignarCandidatosRequest): Promise<{ message: string }> => {
  const { data } = await api.post(`/api/v1/coloquios/convocatorias/${convocatoriaId}/padron`, req);
  return data;
};

// Helper: importar padrón vía archivo (ya existe backend para esto)
export const importarPadronColoquioFile = async (convocatoriaId: string, file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/api/v1/coloquios/convocatorias/${convocatoriaId}/padron/importar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Publicar convocatoria (BORRADOR → PUBLICADA)
export const publicarConvocatoria = async (convocatoriaId: string): Promise<ConvocatoriaColoquio> => {
  const { data } = await api.patch(`/api/v1/coloquios/convocatorias/${convocatoriaId}/publicar`);
  return data;
};

// 3.1 Obtener agenda de la convocatoria
export const obtenerAgendaConvocatoria = async (convocatoriaId: string): Promise<any[]> => {
  const { data } = await api.get(`/api/v1/coloquios/convocatorias/${convocatoriaId}/agenda`);
  return data;
};
