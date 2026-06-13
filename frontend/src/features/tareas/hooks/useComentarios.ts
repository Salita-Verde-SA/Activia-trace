import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tareasApi } from '../services/tareasApi';
import type { ComentarioTareaCreate } from '../types';

export const useComentarios = (tareaId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['comentarios', tareaId],
    queryFn: () => tareasApi.getComentarios(tareaId!),
    enabled: !!tareaId,
  });

  const agregarComentario = useMutation({
    mutationFn: (payload: ComentarioTareaCreate) =>
      tareasApi.agregarComentario(tareaId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios', tareaId] });
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['tareas', tareaId] });
    },
  });

  return {
    comentarios: query.data,
    isLoading: query.isLoading,
    error: query.error,
    agregarComentario,
  };
};
