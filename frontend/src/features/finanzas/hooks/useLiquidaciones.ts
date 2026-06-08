import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liquidacionesApi } from '../services/liquidacionesApi';

export function useLiquidaciones(params?: { periodo_anio?: number; periodo_mes?: number; estado?: string }) {
  const queryClient = useQueryClient();

  const liquidacionesQuery = useQuery({
    queryKey: ['finanzas', 'liquidaciones', params],
    queryFn: () => liquidacionesApi.getAll(params),
  });

  const getLiquidacion = (id: string) => useQuery({
    queryKey: ['finanzas', 'liquidaciones', id],
    queryFn: () => liquidacionesApi.getById(id),
    enabled: !!id,
  });

  const cerrarLiquidacion = useMutation({
    mutationFn: (id: string) => liquidacionesApi.cerrar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'liquidaciones'] }),
  });

  return {
    liquidacionesQuery,
    getLiquidacion,
    cerrarLiquidacion,
  };
}
