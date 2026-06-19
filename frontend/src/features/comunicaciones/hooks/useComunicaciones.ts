import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarLotes, aprobarLote, cancelarLote } from '../services/comunicacionesApi';

export function useListarLotes(soloPendientes = true) {
  return useQuery({
    queryKey: ['comunicaciones', 'lotes', soloPendientes],
    queryFn: () => listarLotes(soloPendientes),
  });
}

export function useAprobarLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (loteId: string) => aprobarLote(loteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicaciones', 'lotes'] });
    },
  });
}

export function useCancelarLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (loteId: string) => cancelarLote(loteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicaciones', 'lotes'] });
    },
  });
}
