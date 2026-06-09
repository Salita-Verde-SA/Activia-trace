import api from '@/shared/services/api';
import type { Usuario } from '../types';

export const usuariosApi = {
  getAll: (params?: { rol?: string; email?: string }) => 
    api.get<Usuario[]>('/api/usuarios', { params }).then(res => res.data),
    
  create: (data: Partial<Usuario>) => 
    api.post<Usuario>('/api/usuarios', data).then(res => res.data),
    
  update: (id: string, data: Partial<Usuario>) => 
    api.patch<Usuario>(`/api/usuarios/${id}`, data).then(res => res.data),
};
