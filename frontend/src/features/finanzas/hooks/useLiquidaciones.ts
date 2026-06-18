import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liquidacionesApi } from '../services/liquidacionesApi';

export function useLiquidaciones(params?: { periodo_anio?: number; periodo_mes?: number; estado?: string }) {
  const queryClient = useQueryClient();

  const liquidacionesQuery = useQuery({
    queryKey: ['finanzas', 'liquidaciones', params],
    queryFn: () => liquidacionesApi.getAll(params),
  });

  const useLiquidacion = (id: string) => useQuery({
    queryKey: ['finanzas', 'liquidaciones', id],
    queryFn: () => liquidacionesApi.getById(id),
    enabled: !!id,
  });

  const cerrarLiquidacion = useMutation({
    mutationFn: (id: string) => liquidacionesApi.cerrar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'liquidaciones'] }),
  });

  const cerrarPeriodo = useMutation({
    mutationFn: (params: { mes: number, anio: number }) => liquidacionesApi.cerrarPeriodo(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'liquidaciones'] }),
  });

  const exportarCSV = useMutation({
    mutationFn: ({ mes, anio }: { mes: number, anio: number }) => liquidacionesApi.exportar(mes, anio),
  });

  return {
    liquidacionesQuery,
    useLiquidacion,
    cerrarLiquidacion,
    cerrarPeriodo,
    exportarCSV,
  };
}
