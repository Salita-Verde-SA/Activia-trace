import api from '@/shared/services/api';
import type {
  AsignacionResponse,
  AsignacionMasivaCreate,
  EquipoDocenteView,
  ClonadoEquipoRequest,
  AsignacionVigenciaUpdate,
  AsignacionDetalleView,
} from '../types';

export const equiposApi = {
  getEquipos: async (materiaId: string): Promise<EquipoDocenteView[]> => {
    const { data } = await api.get(`/api/equipos/materia/${materiaId}`);
    return data;
  },

  asignarMasivo: async (payload: AsignacionMasivaCreate): Promise<AsignacionResponse[]> => {
    const { data } = await api.post('/api/equipos/asignacion-masiva', payload);
    return data;
  },

  clonarEquipo: async (payload: ClonadoEquipoRequest): Promise<AsignacionResponse[]> => {
    const { data } = await api.post('/api/equipos/clonar', payload);
    return data;
  },

  actualizarVigencia: async (payload: AsignacionVigenciaUpdate): Promise<AsignacionResponse[]> => {
    const { data } = await api.patch('/api/equipos/vigencia', payload);
    return data;
  },

  eliminarAsignacion: async (id: string): Promise<void> => {
    await api.delete(`/api/asignaciones/${id}`);
  },

  getMisEquipos: async (): Promise<AsignacionResponse[]> => {
    const { data } = await api.get('/api/equipos/mis-equipos');
    return data;
  },

  getMisEquiposDetalle: async (): Promise<AsignacionDetalleView[]> => {
    const { data } = await api.get('/api/equipos/mis-equipos-detalle');
    return data;
  },
};
