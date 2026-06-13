import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/rolesApi';
import type { RolResponse } from '../api/rolesApi';

export const useRoles = () => {
  return useQuery<RolResponse[], Error>({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
