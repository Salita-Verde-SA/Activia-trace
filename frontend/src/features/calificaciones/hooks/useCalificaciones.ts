import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadCalificacionesFile,
  confirmImportCalificaciones,
  getUmbral,
  setUmbral,
  getAtrasados,
  getRanking,
  getSabana
} from '../services/calificacionesApi';
import type { ImportConfirmRequest, UmbralCreate } from '../types';

export const useUploadCalificacionesPreview = () => {
  return useMutation({
    mutationFn: (file: File) => uploadCalificacionesFile(file),
  });
};

export const useConfirmImport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ImportConfirmRequest) => confirmImportCalificaciones(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atrasados', variables.materia_id] });
      queryClient.invalidateQueries({ queryKey: ['ranking', variables.materia_id] });
      queryClient.invalidateQueries({ queryKey: ['sabana', variables.materia_id] });
    },
  });
};

export const useUmbral = (materiaId: string) => {
  return useQuery({
    queryKey: ['umbral', materiaId],
    queryFn: () => getUmbral(materiaId),
    enabled: !!materiaId,
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
