import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  uploadCalificacionesFile,
  confirmImportCalificaciones,
  getUmbral,
  setUmbral,
  getAtrasados,
  getRanking,
  getSabana,
  getPadronesActivos,
  importarPadronComision,
} from '../services/calificacionesApi';
import type { ImportConfirmRequest, UmbralCreate } from '../types';
import { PLACEHOLDER_UUID } from '@/shared/constants';

export const usePadronesActivos = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  return useQuery({
    queryKey: ['padrones-activos'],
    queryFn: getPadronesActivos,
    enabled: isAuthenticated && !authLoading,
  });
};

export const useImportarPadronComision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ materiaId, cohorteId, file }: { materiaId: string; cohorteId: string; file: File }) =>
      importarPadronComision(materiaId, cohorteId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['padrones-activos'] });
    },
  });
};

export const useUploadCalificacionesPreview = () => {
  return useMutation({
    mutationFn: (file: File) => uploadCalificacionesFile(file),
  });
};

export const useConfirmImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, file }: { data: ImportConfirmRequest; file: File }) =>
      confirmImportCalificaciones(data, file),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['atrasados', data.materia_id] });
      queryClient.invalidateQueries({ queryKey: ['ranking', data.materia_id] });
      queryClient.invalidateQueries({ queryKey: ['sabana', data.materia_id] });
    },
  });
};

export const useUmbral = (materiaId: string) => {
  return useQuery({
    queryKey: ['umbral', materiaId],
    queryFn: () => getUmbral(materiaId),
    enabled: !!materiaId && materiaId !== PLACEHOLDER_UUID,
    retry: false,
  });
};

export const useSetUmbral = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UmbralCreate) => setUmbral(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['umbral', variables.materia_id] });
      queryClient.invalidateQueries({ queryKey: ['atrasados', variables.materia_id] });
    },
  });
};

export const useAtrasados = (materiaId: string) => {
  return useQuery({
    queryKey: ['atrasados', materiaId],
    queryFn: () => getAtrasados(materiaId),
    enabled: !!materiaId,
  });
};

export const useRanking = (materiaId: string) => {
  return useQuery({
    queryKey: ['ranking', materiaId],
    queryFn: () => getRanking(materiaId),
    enabled: !!materiaId,
  });
};

export const useSabana = (materiaId: string) => {
  return useQuery({
    queryKey: ['sabana', materiaId],
    queryFn: () => getSabana(materiaId),
    enabled: !!materiaId,
  });
};
