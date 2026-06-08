import { api } from '@/shared/services/api';
import { SalarioBase, SalarioPlus } from '../types';

export const salariosApi = {
  getBase: () => 
    api.get<SalarioBase[]>('/api/salarios/base').then(res => res.data),
  createBase: (data: Partial<SalarioBase>) => 
    api.post<SalarioBase>('/api/salarios/base', data).then(res => res.data),
  updateBase: (id: string, data: Partial<SalarioBase>) => 
    api.put<SalarioBase>(`/api/salarios/base/${id}`, data).then(res => res.data),

  getPlus: () => 
    api.get<SalarioPlus[]>('/api/salarios/plus').then(res => res.data),
  createPlus: (data: Partial<SalarioPlus>) => 
    api.post<SalarioPlus>('/api/salarios/plus', data).then(res => res.data),
  updatePlus: (id: string, data: Partial<SalarioPlus>) => 
    api.put<SalarioPlus>(`/api/salarios/plus/${id}`, data).then(res => res.data),
};
