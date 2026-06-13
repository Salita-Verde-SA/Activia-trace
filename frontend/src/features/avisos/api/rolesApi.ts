import api from '@/shared/services/api';

export interface RolResponse {
  id: string;
  nombre: string;
}

export const rolesApi = {
  getRoles: async (): Promise<RolResponse[]> => {
    const { data } = await api.get('/api/v1/roles/');
    return data;
  },
};
