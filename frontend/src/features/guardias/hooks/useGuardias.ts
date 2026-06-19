import { useQuery, useMutation } from '@tanstack/react-query';
import { guardiasApi } from '../services/guardiasApi';
import type { GuardiaCreate } from '../types';

export function useRegistrarGuardia() {
  return useMutation({
    mutationFn: ({ asignacionId, data }: { asignacionId: string; data: GuardiaCreate }) =>
      guardiasApi.registrar(asignacionId, data),
  });
}

export function useListarGuardias(fechaDesde: string | null, fechaHasta: string | null) {
  return useQuery({
    queryKey: ['guardias', 'lista', fechaDesde, fechaHasta],
    queryFn: () => guardiasApi.listar(fechaDesde!, fechaHasta!),
    enabled: !!fechaDesde && !!fechaHasta,
  });
}
