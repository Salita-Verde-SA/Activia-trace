import { api } from '@/shared/services/api';
import { Carrera, Cohorte, Materia } from '../types';

export const estructuraApi = {
  getCarreras: () => api.get<Carrera[]>('/api/admin/carreras').then(res => res.data),
  createCarrera: (data: Partial<Carrera>) => api.post<Carrera>('/api/admin/carreras', data).then(res => res.data),
  updateCarrera: (id: string, data: Partial<Carrera>) => api.put<Carrera>(`/api/admin/carreras/${id}`, data).then(res => res.data),
  
  getCohortes: () => api.get<Cohorte[]>('/api/admin/cohortes').then(res => res.data),
  createCohorte: (data: Partial<Cohorte>) => api.post<Cohorte>('/api/admin/cohortes', data).then(res => res.data),
  updateCohorte: (id: string, data: Partial<Cohorte>) => api.put<Cohorte>(`/api/admin/cohortes/${id}`, data).then(res => res.data),
  
  getMaterias: () => api.get<Materia[]>('/api/admin/materias').then(res => res.data),
  createMateria: (data: Partial<Materia>) => api.post<Materia>('/api/admin/materias', data).then(res => res.data),
  updateMateria: (id: string, data: Partial<Materia>) => api.put<Materia>(`/api/admin/materias/${id}`, data).then(res => res.data),
};
