import { useMutation } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Decode user data from access token payload
      const token = data.access_token;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const user = {
        id: payload.sub,
        tenant_id: payload.tenant_id,
        roles: payload.roles || []
      };

      login(data.access_token, data.refresh_token, user);
      navigate('/dashboard', { replace: true });
    },
  });
};
