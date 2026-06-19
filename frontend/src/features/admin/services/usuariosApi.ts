import api from '@/shared/services/api';
import type { Usuario } from '../types';

export const usuariosApi = {
  getAll: (params?: { rol?: string; email?: string }) => 
    api.get<Usuario[]>('/api/usuarios/', { params }).then(res => res.data),
    
  create: async (data: Record<string, unknown>) => {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const res = await api.post<Usuario>('/api/usuarios/', clean);
    return res.data;
  },
    
  update: (id: string, data: Partial<Usuario>) => 
    api.patch<Usuario>(`/api/usuarios/${id}`, data).then(res => res.data),
};
