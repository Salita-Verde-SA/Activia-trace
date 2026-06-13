import api from '@/shared/services/api';
import type { AvisoAlumno, ColoquioDisponible, EstadoMateria } from '../types';

export const alumnoApi = {
  getMisAvisos: () => 
    api.get<AvisoAlumno[]>('/api/v1/avisos/mis-avisos').then(res => res.data),

  ackAviso: (avisoId: string) => 
    api.post(`/api/v1/avisos/ack`, { aviso_id: avisoId }).then(res => res.data),

  getMisColoquios: () => 
    api.get<ColoquioDisponible[]>('/api/v1/coloquios/disponibles').then(res => res.data),

  reservarColoquio: (instanciaId: string) => 
    api.post(`/api/v1/coloquios/reservar`, { coloquio_id: instanciaId }).then(res => res.data),

  cancelarReserva: (reservaId: string) => 
    api.post(`/api/v1/coloquios/reservas/${reservaId}/cancelar`).then(res => res.data),

  getMiEstado: () => 
    api.get<EstadoMateria[]>('/api/calificaciones/mi-estado').then(res => res.data),
};
