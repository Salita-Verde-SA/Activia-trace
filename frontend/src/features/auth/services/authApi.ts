import api from '@/shared/services/api';

export const authApi = {
  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refresh_token: refreshToken }),
};
