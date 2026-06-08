import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../services/usuariosApi';
import type { Usuario } from '../types';

export function useUsuarios(params?: { rol?: string; email?: string }) {
  const queryClient = useQueryClient();

  const usuariosQuery = useQuery({
    queryKey: ['admin', 'usuarios', params],
    queryFn: () => usuariosApi.getAll(params),
  });

  const createUsuario = useMutation({
    mutationFn: (data: Partial<Usuario>) => usuariosApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  });

  const updateUsuario = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Usuario> }) => 
      usuariosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  });

  return {
    usuariosQuery,
    createUsuario,
    updateUsuario,
  };
}
