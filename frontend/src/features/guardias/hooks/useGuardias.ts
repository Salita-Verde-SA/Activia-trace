import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardiasApi } from '../services/guardiasApi';
import type { GuardiaCreate } from '../types';

export function useRegistrarGuardia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ asignacionId, data }: { asignacionId: string; data: GuardiaCreate }) =>
      guardiasApi.registrar(asignacionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guardias', 'mis-guardias'] });
    },
  });
}

export function useMisGuardias() {
  return useQuery({
    queryKey: ['guardias', 'mis-guardias'],
    queryFn: () => guardiasApi.misGuardias(),
  });
}

export function useListarGuardias(fechaDesde: string | null, fechaHasta: string | null) {
  return useQuery({
    queryKey: ['guardias', 'lista', fechaDesde, fechaHasta],
    queryFn: () => guardiasApi.listar(fechaDesde!, fechaHasta!),
    enabled: !!fechaDesde && !!fechaHasta,
  });
}
