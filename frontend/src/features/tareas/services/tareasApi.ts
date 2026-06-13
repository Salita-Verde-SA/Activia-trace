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
    const { data } = await api.get('/api/v1/tareas/mis-tareas');
    return data;
  },

  getTareasAsignadasPorMi: async (): Promise<TareaResponse[]> => {
    const { data } = await api.get('/api/v1/tareas/asignadas-por-mi');
    return data;
  },

  getTareasGlobales: async (): Promise<TareaResponse[]> => {
    const { data } = await api.get('/api/v1/tareas/globales');
    return data;
  },

  getTarea: async (id: string): Promise<TareaResponse> => {
    const { data } = await api.get(`/api/v1/tareas/${id}`);
    return data;
  },

  getUsuariosAsignables: async () => {
    const { data } = await api.get('/api/v1/tareas/asignables');
    return data;
  },

  crearTarea: async (payload: TareaCreate): Promise<TareaResponse> => {
    const { data } = await api.post('/api/v1/tareas/', payload);
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

  getComentarios: async (id: string): Promise<ComentarioTareaResponse[]> => {
    const { data } = await api.get(`/api/v1/tareas/${id}/comentarios`);
    return data;
  },
};
