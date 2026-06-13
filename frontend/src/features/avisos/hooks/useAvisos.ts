import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { avisosApi } from '../services/avisosApi';
import type { AvisoCreate, AvisoAcknowledgmentCreate } from '../types';

export const useAvisos = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['avisos'],
    queryFn: avisosApi.getAvisos,
  });

  const crearAviso = useMutation({
    mutationFn: (payload: AvisoCreate) => avisosApi.crearAviso(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
    },
  });

  const darAcuse = useMutation({
    mutationFn: (payload: AvisoAcknowledgmentCreate) => avisosApi.darAcuse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
    },
  });

  return {
    avisos: query.data,
    isLoading: query.isLoading,
    error: query.error,
    crearAviso,
    darAcuse,
  };
};

export const useTodosAvisos = () => {
  return useQuery({
    queryKey: ['avisos', 'todos'],
    queryFn: avisosApi.getTodos,
  });
};

export const useAvisoMetrics = (avisoId?: string) => {
  return useQuery({
    queryKey: ['avisoMetrics', avisoId],
    queryFn: () => avisosApi.getAvisoMetrics(avisoId!),
    enabled: !!avisoId,
    refetchInterval: 10000, // Poll every 10s
  });
};
