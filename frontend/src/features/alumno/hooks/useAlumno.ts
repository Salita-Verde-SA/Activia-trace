import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnoApi } from '../services/alumnoApi';

export const ALUMNO_KEYS = {
  avisos: ['alumno', 'avisos'] as const,
  coloquios: ['alumno', 'coloquios'] as const,
  estado: ['alumno', 'estado'] as const,
};

export function useAvisosAlumno() {
  return useQuery({
    queryKey: ALUMNO_KEYS.avisos,
    queryFn: alumnoApi.getMisAvisos,
  });
}

export function useAckAviso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alumnoApi.ackAviso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUMNO_KEYS.avisos });
    },
  });
}

export function useColoquiosAlumno() {
  return useQuery({
    queryKey: ALUMNO_KEYS.coloquios,
    queryFn: alumnoApi.getMisColoquios,
  });
}

export function useReservarColoquio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alumnoApi.reservarColoquio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUMNO_KEYS.coloquios });
    },
  });
}

export function useCancelarReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alumnoApi.cancelarReserva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUMNO_KEYS.coloquios });
    },
  });
}

export function useEstadoAlumno() {
  return useQuery({
    queryKey: ALUMNO_KEYS.estado,
    queryFn: alumnoApi.getMiEstado,
  });
}
