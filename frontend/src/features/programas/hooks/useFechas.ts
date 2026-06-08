import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFechasByMateria, createFecha, updateFecha, deleteFecha } from '../services/fechasApi';
import { FechaAcademicaCreate, FechaAcademicaUpdate } from '../types';

export const useFechas = (materiaId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fechas-academicas', materiaId],
    queryFn: () => getFechasByMateria(materiaId),
    enabled: !!materiaId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FechaAcademicaCreate) => createFecha(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas-academicas', materiaId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FechaAcademicaUpdate }) => updateFecha({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas-academicas', materiaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFecha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas-academicas', materiaId] });
    },
  });

  return {
    ...query,
    createFecha: createMutation.mutateAsync,
    updateFecha: updateMutation.mutateAsync,
    deleteFecha: deleteMutation.mutateAsync,
  };
};
