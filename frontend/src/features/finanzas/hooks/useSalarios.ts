import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salariosApi } from '../services/salariosApi';
import { SalarioBase, SalarioPlus } from '../types';

export function useSalarios() {
  const queryClient = useQueryClient();

  const salariosBaseQuery = useQuery({
    queryKey: ['finanzas', 'salarios', 'base'],
    queryFn: () => salariosApi.getBase(),
  });

  const createSalarioBase = useMutation({
    mutationFn: (data: Partial<SalarioBase>) => salariosApi.createBase(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'salarios', 'base'] }),
  });

  const updateSalarioBase = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalarioBase> }) => 
      salariosApi.updateBase(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'salarios', 'base'] }),
  });

  const salariosPlusQuery = useQuery({
    queryKey: ['finanzas', 'salarios', 'plus'],
    queryFn: () => salariosApi.getPlus(),
  });

  const createSalarioPlus = useMutation({
    mutationFn: (data: Partial<SalarioPlus>) => salariosApi.createPlus(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'salarios', 'plus'] }),
  });

  const updateSalarioPlus = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalarioPlus> }) => 
      salariosApi.updatePlus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finanzas', 'salarios', 'plus'] }),
  });

  return {
    salariosBaseQuery,
    createSalarioBase,
    updateSalarioBase,
    
    salariosPlusQuery,
    createSalarioPlus,
    updateSalarioPlus,
  };
}
