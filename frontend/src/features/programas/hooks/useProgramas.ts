import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProgramasByMateria, createPrograma, updatePrograma, deletePrograma } from '../services/programasApi';
import { ProgramaMateriaCreate, ProgramaMateriaUpdate } from '../types';

export const useProgramas = (materiaId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['programas', materiaId],
    queryFn: () => getProgramasByMateria(materiaId),
    enabled: !!materiaId,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProgramaMateriaCreate) => createPrograma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas', materiaId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProgramaMateriaUpdate }) => updatePrograma({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas', materiaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePrograma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas', materiaId] });
    },
  });

  return {
    ...query,
    createPrograma: createMutation.mutateAsync,
    updatePrograma: updateMutation.mutateAsync,
    deletePrograma: deleteMutation.mutateAsync,
  };
};
