import api from '@/shared/services/api';
import type {
  TareaResponse,
  TareaCreate,
  TareaUpdateEstado,
  ComentarioTareaCreate,
  ComentarioTareaResponse,
} from '../types';

export const tareasApi = {
  getTareas: async (): Promise<TareaResponse[]> => {
    const { data } = await api.get('/api/v1/tareas');
    return data;
  },

  getTarea: async (id: string): Promise<TareaResponse> => {
    const { data } = await api.get(`/api/v1/tareas/${id}`);
    return data;
  },

  crearTarea: async (payload: TareaCreate): Promise<TareaResponse> => {
    const { data } = await api.post('/api/v1/tareas', payload);
    return data;
  },

  actualizarEstado: async (id: string, payload: TareaUpdateEstado): Promise<TareaResponse> => {
    const { data } = await api.patch(`/api/v1/tareas/${id}/estado`, payload);
    return data;
  },

  agregarComentario: async (id: string, payload: ComentarioTareaCreate): Promise<ComentarioTareaResponse> => {
    const { data } = await api.post(`/api/v1/tareas/${id}/comentarios`, payload);
    return data;
  },
};
