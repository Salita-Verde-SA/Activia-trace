import api from '@/shared/services/api';
import type { GuardiaCreate, GuardiaResponse } from '../types';

export const guardiasApi = {
  registrar: (asignacionId: string, data: GuardiaCreate) =>
    api
      .post<GuardiaResponse>(
        `/api/v1/guardias/asignaciones/${asignacionId}/guardias`,
        data
      )
      .then(res => res.data),

  listar: (fechaDesde: string, fechaHasta: string) =>
    api
      .get<GuardiaResponse[]>('/api/v1/guardias/guardias', {
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta },
      })
      .then(res => res.data),

  misGuardias: () =>
    api.get<GuardiaResponse[]>('/api/v1/guardias/mis-guardias').then(res => res.data),
};
