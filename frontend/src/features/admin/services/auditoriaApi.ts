import api from '@/shared/services/api';
import type { AuditLog } from '../types';

export interface AuditLogResponse {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
}

export const auditoriaApi = {
  getLogs: (params?: { 
    desde?: string; 
    hasta?: string; 
    accion?: string; 
    actor_id?: string;
    materia_id?: string;
    page?: number;
    size?: number;
  }) => 
    api.get<AuditLogResponse>('/api/v1/auditoria/explorar', { params }).then(res => res.data),
};
