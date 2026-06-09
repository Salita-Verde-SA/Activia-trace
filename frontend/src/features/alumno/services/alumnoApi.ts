import api from '@/shared/services/api';
import type { AvisoAlumno, ColoquioDisponible, EstadoMateria } from '../types';

export const alumnoApi = {
  getMisAvisos: () => 
    api.get<AvisoAlumno[]>('/api/v1/avisos/mis-avisos').then(res => res.data),

  ackAviso: (avisoId: string) => 
    api.post(`/api/v1/avisos/${avisoId}/ack`).then(res => res.data),

  getMisColoquios: () => 
    api.get<ColoquioDisponible[]>('/api/coloquios/disponibles').then(res => res.data),

  reservarColoquio: (instanciaId: string) => 
    api.post(`/api/coloquios/${instanciaId}/reservar`).then(res => res.data),

  cancelarReserva: (reservaId: string) => 
    api.post(`/api/coloquios/reservas/${reservaId}/cancelar`).then(res => res.data),

  getMiEstado: () => 
    api.get<EstadoMateria[]>('/api/v1/calificaciones/mi-estado').then(res => res.data),
};
