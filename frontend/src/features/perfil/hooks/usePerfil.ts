import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perfilApi } from '../services/perfilApi';
import type { PerfilUpdate } from '../types';

export function usePerfil() {
  const queryClient = useQueryClient();

  const perfilQuery = useQuery({
    queryKey: ['perfil', 'me'],
    queryFn: perfilApi.get,
  });

  const actualizarPerfil = useMutation({
    mutationFn: (data: PerfilUpdate) => perfilApi.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['perfil', 'me'] }),
  });

  return { perfilQuery, actualizarPerfil };
}
