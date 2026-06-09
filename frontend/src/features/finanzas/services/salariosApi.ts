import api from '@/shared/services/api';
import type { SalarioBase, SalarioPlus } from '../types';

export const salariosApi = {
  getBase: () => 
    api.get<any[]>('/api/v1/salarios/base').then(res => 
      res.data.map(item => ({
        ...item,
        vigente_desde: item.fecha_desde,
        vigente_hasta: item.fecha_hasta
      })) as SalarioBase[]
    ),
  createBase: (data: Partial<SalarioBase>) => {
    const payload = {
      ...data,
      fecha_desde: data.vigente_desde,
      fecha_hasta: data.vigente_hasta,
    };
    delete (payload as any).vigente_desde;
    delete (payload as any).vigente_hasta;
    return api.post<any>('/api/v1/salarios/base', payload).then(res => ({
      ...res.data,
      vigente_desde: res.data.fecha_desde,
      vigente_hasta: res.data.fecha_hasta
    }) as SalarioBase);
  },
  updateBase: (id: string, data: Partial<SalarioBase>) => {
    const payload = {
      ...data,
      fecha_desde: data.vigente_desde,
      fecha_hasta: data.vigente_hasta,
    };
    delete (payload as any).vigente_desde;
    delete (payload as any).vigente_hasta;
    return api.put<any>(`/api/v1/salarios/base/${id}`, payload).then(res => ({
      ...res.data,
      vigente_desde: res.data.fecha_desde,
      vigente_hasta: res.data.fecha_hasta
    }) as SalarioBase);
  },

  getPlus: () => 
    api.get<any[]>('/api/v1/salarios/plus').then(res => 
      res.data.map(item => ({
        ...item,
        vigente_desde: item.fecha_desde,
        vigente_hasta: item.fecha_hasta,
        grupo_nombre: item.clave_plus
      })) as SalarioPlus[]
    ),
  createPlus: (data: Partial<SalarioPlus>) => {
    const payload = {
      ...data,
      fecha_desde: data.vigente_desde,
      fecha_hasta: data.vigente_hasta,
      clave_plus: data.grupo_nombre,
    };
    delete (payload as any).vigente_desde;
    delete (payload as any).vigente_hasta;
    delete (payload as any).grupo_nombre;
    return api.post<any>('/api/v1/salarios/plus', payload).then(res => ({
      ...res.data,
      vigente_desde: res.data.fecha_desde,
      vigente_hasta: res.data.fecha_hasta,
      grupo_nombre: res.data.clave_plus
    }) as SalarioPlus);
  },
  updatePlus: (id: string, data: Partial<SalarioPlus>) => {
    const payload = {
      ...data,
      fecha_desde: data.vigente_desde,
      fecha_hasta: data.vigente_hasta,
      clave_plus: data.grupo_nombre,
    };
    delete (payload as any).vigente_desde;
    delete (payload as any).vigente_hasta;
    delete (payload as any).grupo_nombre;
    return api.put<any>(`/api/v1/salarios/plus/${id}`, payload).then(res => ({
      ...res.data,
      vigente_desde: res.data.fecha_desde,
      vigente_hasta: res.data.fecha_hasta,
      grupo_nombre: res.data.clave_plus
    }) as SalarioPlus);
  },
};
