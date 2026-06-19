import api from '@/shared/services/api';
import type { PerfilData, PerfilUpdate } from '../types';

export const perfilApi = {
  get: () =>
    api.get<PerfilData>('/api/v1/perfil/me').then(res => res.data),

  update: (data: PerfilUpdate) =>
    api.put<PerfilData>('/api/v1/perfil/me', data).then(res => res.data),
};
