import api from '@/shared/services/api';
import type {
  HiloListResponse,
  HiloResponse,
  MensajeInternoResponse,
  HiloCreate,
  MensajeInternoCreate,
  UsuarioMensajeria,
} from '../types';

export const mensajeriaApi = {
  getUsuariosTenant: async (): Promise<UsuarioMensajeria[]> => {
    const { data } = await api.get('/api/v1/mensajes/internos/usuarios-tenant');
    return data;
  },

  getBandeja: async (): Promise<HiloListResponse[]> => {
    const { data } = await api.get('/api/v1/mensajes/internos/inbox');
    return data;
  },

  getNoLeidos: async (): Promise<number> => {
    const { data } = await api.get('/api/v1/mensajes/internos/no-leidos');
    return data;
  },

  iniciarHilo: async (payload: HiloCreate): Promise<HiloResponse> => {
    const { data } = await api.post('/api/v1/mensajes/internos/hilos', payload);
    return data;
  },

  getHilo: async (hiloId: string): Promise<HiloResponse> => {
    const { data } = await api.get(`/api/v1/mensajes/internos/hilos/${hiloId}`);
    return data;
  },

  responderHilo: async (hiloId: string, payload: MensajeInternoCreate): Promise<MensajeInternoResponse> => {
    const { data } = await api.post(`/api/v1/mensajes/internos/hilos/${hiloId}/mensajes`, payload);
    return data;
  },
};
