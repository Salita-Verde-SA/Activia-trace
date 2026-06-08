import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../services/auditoriaApi';

export function useAuditoria(params?: { 
  desde?: string; 
  hasta?: string; 
  accion?: string; 
  actor_id?: string;
  materia_id?: string;
  page?: number;
  size?: number;
}) {
  const auditoriaQuery = useQuery({
    queryKey: ['admin', 'auditoria', params],
    queryFn: () => auditoriaApi.getLogs(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });

  return {
    auditoriaQuery,
  };
}
