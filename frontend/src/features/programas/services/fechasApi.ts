import api from '@/shared/services/api';
import type { FechaAcademica, FechaAcademicaCreate, FechaAcademicaUpdate } from '../types';

export const getFechasByMateria = async (materiaId: string): Promise<FechaAcademica[]> => {
  const response = await api.get(`/api/fechas-academicas/materia/${materiaId}`);
  return response.data;
};

export const getFecha = async (id: string): Promise<FechaAcademica> => {
  const response = await api.get(`/api/fechas-academicas/${id}`);
  return response.data;
};

export const createFecha = async (data: FechaAcademicaCreate): Promise<FechaAcademica> => {
  const response = await api.post('/api/fechas-academicas', data);
  return response.data;
};

export const updateFecha = async ({ id, data }: { id: string; data: FechaAcademicaUpdate }): Promise<FechaAcademica> => {
  const response = await api.patch(`/api/fechas-academicas/${id}`, data);
  return response.data;
};

export const deleteFecha = async (id: string): Promise<void> => {
  await api.delete(`/api/fechas-academicas/${id}`);
};
