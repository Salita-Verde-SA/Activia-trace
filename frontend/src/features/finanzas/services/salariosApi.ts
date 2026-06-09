import api from '@/shared/services/api';
import type { SalarioBase, SalarioPlus } from '../types';

export const salariosApi = {
  getBase: () => 
    api.get<SalarioBase[]>('/api/v1/salarios/base').then(res => res.data),
  createBase: (data: Partial<SalarioBase>) => 
    api.post<SalarioBase>('/api/v1/salarios/base', data).then(res => res.data),
  updateBase: (id: string, data: Partial<SalarioBase>) => 
    api.put<SalarioBase>(`/api/v1/salarios/base/${id}`, data).then(res => res.data),

  getPlus: () => 
    api.get<SalarioPlus[]>('/api/v1/salarios/plus').then(res => res.data),
  createPlus: (data: Partial<SalarioPlus>) => 
    api.post<SalarioPlus>('/api/v1/salarios/plus', data).then(res => res.data),
  updatePlus: (id: string, data: Partial<SalarioPlus>) => 
    api.put<SalarioPlus>(`/api/v1/salarios/plus/${id}`, data).then(res => res.data),
};
