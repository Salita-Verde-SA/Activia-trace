import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturasApi } from '../services/facturasApi';
import type { Factura } from '../types';

export function useFacturas(params?: { periodo_anio?: number; periodo_mes?: number }) {
  const queryClient = useQueryClient();

  const facturasQuery = useQuery({
    queryKey: ['finanzas', 'facturas', params],
    queryFn: () => facturasApi.getAll(params),
  });

  const createFactura = useMutation({
    mutationFn: (data: Partial<Factura>) => facturasApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'facturas'] }),
  });

  return {
    facturasQuery,
    createFactura,
  };
}
