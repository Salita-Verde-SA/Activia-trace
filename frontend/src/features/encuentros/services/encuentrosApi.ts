import api from '@/shared/services/api';
import type {
  InstanciaEncuentro,
  SlotEncuentroCreate,
  InstanciaEncuentroUpdate,
  EncuentroRecurrenteResponse,
} from '../types';

export const encuentrosApi = {
  getInstanciasPorMateria: async (materiaId: string): Promise<InstanciaEncuentro[]> => {
    const { data } = await api.get(`/api/v1/encuentros/materias/${materiaId}/instancias`);
    return data;
  },

  getMisInstancias: async (): Promise<InstanciaEncuentro[]> => {
    const { data } = await api.get('/api/v1/encuentros/mis-instancias');
    return data;
  },

  getEncuentrosAlumno: async (): Promise<InstanciaEncuentro[]> => {
    const { data } = await api.get('/api/v1/encuentros/mis-encuentros-alumno');
    return data;
  },

  crearEncuentro: async (
    asignacionId: string,
    payload: SlotEncuentroCreate
  ): Promise<EncuentroRecurrenteResponse> => {
    const { data } = await api.post(
      `/api/v1/encuentros/asignaciones/${asignacionId}/encuentros`,
      payload
    );
    return data;
  },

  editarInstancia: async (
    instanciaId: string,
    payload: InstanciaEncuentroUpdate
  ): Promise<InstanciaEncuentro> => {
    const { data } = await api.patch(
      `/api/v1/encuentros/instancias-encuentros/${instanciaId}`,
      payload
    );
    return data;
  },

  getEncuentrosHtml: async (materiaId: string): Promise<string> => {
    const { data } = await api.get<string>(
      `/api/v1/encuentros/materias/${materiaId}/encuentros/html`,
      { responseType: 'text' }
    );
    return data;
  },
};
