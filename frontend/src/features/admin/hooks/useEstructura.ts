import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estructuraApi } from '../services/estructuraApi';
import type { Carrera, Cohorte, Materia } from '../types';

export function useEstructura() {
  const queryClient = useQueryClient();

  // Carreras
  const carrerasQuery = useQuery({
    queryKey: ['admin', 'carreras'],
    queryFn: () => estructuraApi.getCarreras(),
  });

  const createCarrera = useMutation({
    mutationFn: (data: Partial<Carrera>) => estructuraApi.createCarrera(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'carreras'] }),
  });

  const updateCarrera = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Carrera> }) => 
      estructuraApi.updateCarrera(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'carreras'] }),
  });

  // Cohortes
  const cohortesQuery = useQuery({
    queryKey: ['admin', 'cohortes'],
    queryFn: () => estructuraApi.getCohortes(),
  });

  const createCohorte = useMutation({
    mutationFn: (data: Partial<Cohorte>) => estructuraApi.createCohorte(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cohortes'] }),
  });

  const updateCohorte = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cohorte> }) => 
      estructuraApi.updateCohorte(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cohortes'] }),
  });

  // Materias
  const materiasQuery = useQuery({
    queryKey: ['admin', 'materias'],
    queryFn: () => estructuraApi.getMaterias(),
  });

  const createMateria = useMutation({
    mutationFn: (data: Partial<Materia>) => estructuraApi.createMateria(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'materias'] }),
  });

  const updateMateria = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Materia> }) => 
      estructuraApi.updateMateria(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'materias'] }),
  });

  return {
    carrerasQuery,
    createCarrera,
    updateCarrera,
    
    cohortesQuery,
    createCohorte,
    updateCohorte,
    
    materiasQuery,
    createMateria,
    updateMateria,
  };
}
