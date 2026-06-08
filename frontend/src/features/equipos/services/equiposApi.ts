import api from '@/shared/services/api';
import {
  AsignacionResponse,
  AsignacionMasivaCreate,
  EquipoDocenteView,
  ClonadoEquipoRequest,
  AsignacionVigenciaUpdate,
} from '../types';

export const equiposApi = {
  getEquipos: async (materiaId: string): Promise<EquipoDocenteView[]> => {
    const { data } = await api.get(`/api/v1/asignaciones/materia/${materiaId}`);
    return data;
  },

  asignarMasivo: async (payload: AsignacionMasivaCreate): Promise<AsignacionResponse[]> => {
    const { data } = await api.post('/api/v1/asignaciones/masivo', payload);
    return data;
  },

  clonarEquipo: async (payload: ClonadoEquipoRequest): Promise<AsignacionResponse[]> => {
    const { data } = await api.post('/api/v1/asignaciones/clonar', payload);
    return data;
  },

  actualizarVigencia: async (payload: AsignacionVigenciaUpdate): Promise<AsignacionResponse[]> => {
    const { data } = await api.patch('/api/v1/asignaciones/vigencia', payload);
    return data;
  },

  eliminarAsignacion: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/asignaciones/${id}`);
  },
};
