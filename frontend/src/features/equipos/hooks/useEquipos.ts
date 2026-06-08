import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equiposApi } from '../services/equiposApi';
import type { AsignacionMasivaCreate, ClonadoEquipoRequest, AsignacionVigenciaUpdate } from '../types';

export const useEquipos = (materiaId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['equipos', materiaId],
    queryFn: () => equiposApi.getEquipos(materiaId!),
    enabled: !!materiaId,
  });

  const asignarMasivo = useMutation({
    mutationFn: (payload: AsignacionMasivaCreate) => equiposApi.asignarMasivo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });

  const clonar = useMutation({
    mutationFn: (payload: ClonadoEquipoRequest) => equiposApi.clonarEquipo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });

  const actualizarVigencia = useMutation({
    mutationFn: (payload: AsignacionVigenciaUpdate) => equiposApi.actualizarVigencia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => equiposApi.eliminarAsignacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });

  return {
    equipos: query.data,
    isLoading: query.isLoading,
    error: query.error,
    asignarMasivo,
    clonar,
    actualizarVigencia,
    eliminar,
  };
};
