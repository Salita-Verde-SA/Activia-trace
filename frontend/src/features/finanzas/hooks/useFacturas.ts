import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturasApi } from '../services/facturasApi';

export function useFacturas(params?: { periodo_anio?: number; periodo_mes?: number }) {
  const queryClient = useQueryClient();

  const facturasQuery = useQuery({
    queryKey: ['finanzas', 'facturas', params],
    queryFn: () => facturasApi.getAll(params),
  });

  const uploadFactura = useMutation({
    mutationFn: (data: FormData) => facturasApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'facturas'] }),
  });

  const abonarFactura = useMutation({
    mutationFn: (id: string) => facturasApi.abonar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'facturas'] }),
  });

  const descargarFactura = useMutation({
    mutationFn: ({ id, mes, anio }: { id: string, mes: number, anio: number }) => facturasApi.descargar(id, mes, anio),
  });

  return {
    facturasQuery,
    uploadFactura,
    abonarFactura,
    descargarFactura,
  };
}
