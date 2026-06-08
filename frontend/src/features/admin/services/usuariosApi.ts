import { api } from '@/shared/services/api';
import { Usuario } from '../types';

export const usuariosApi = {
  getAll: (params?: { rol?: string; email?: string }) => 
    api.get<Usuario[]>('/api/admin/usuarios', { params }).then(res => res.data),
    
  create: (data: Partial<Usuario>) => 
    api.post<Usuario>('/api/admin/usuarios', data).then(res => res.data),
    
  update: (id: string, data: Partial<Usuario>) => 
    api.put<Usuario>(`/api/admin/usuarios/${id}`, data).then(res => res.data),
};
