import api from '@/shared/services/api';
import type { ProgramaMateria, ProgramaMateriaCreate, ProgramaMateriaUpdate } from '../types';

export const getProgramasByMateria = async (materiaId: string): Promise<ProgramaMateria[]> => {
  const response = await api.get(`/api/programas/materia/${materiaId}`);
  return response.data;
};

export const getPrograma = async (id: string): Promise<ProgramaMateria> => {
  const response = await api.get(`/api/programas/${id}`);
  return response.data;
};

export const createPrograma = async (data: ProgramaMateriaCreate): Promise<ProgramaMateria> => {
  const response = await api.post('/api/programas', data);
  return response.data;
};

export const updatePrograma = async ({ id, data }: { id: string; data: ProgramaMateriaUpdate }): Promise<ProgramaMateria> => {
  const response = await api.patch(`/api/programas/${id}`, data);
  return response.data;
};

export const deletePrograma = async (id: string): Promise<void> => {
  await api.delete(`/api/programas/${id}`);
};
