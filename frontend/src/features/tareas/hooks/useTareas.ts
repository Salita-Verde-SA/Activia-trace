import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tareasApi } from '../services/tareasApi';
import { TareaCreate, TareaUpdateEstado, ComentarioTareaCreate } from '../types';

export const useTareas = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tareas'],
    queryFn: tareasApi.getTareas,
  });

  const crearTarea = useMutation({
    mutationFn: (payload: TareaCreate) => tareasApi.crearTarea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });

  const actualizarEstado = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TareaUpdateEstado }) =>
      tareasApi.actualizarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });

  const agregarComentario = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ComentarioTareaCreate }) =>
      tareasApi.agregarComentario(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['tareas', id] });
    },
  });

  return {
    tareas: query.data,
    isLoading: query.isLoading,
    error: query.error,
    crearTarea,
    actualizarEstado,
    agregarComentario,
  };
};

export const useTarea = (id?: string) => {
  return useQuery({
    queryKey: ['tareas', id],
    queryFn: () => tareasApi.getTarea(id!),
    enabled: !!id,
  });
};
