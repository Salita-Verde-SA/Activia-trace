from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, String, cast
from fastapi import HTTPException, status
from datetime import datetime

from models.audit import AuditLog
from models.user import Usuario
from models.rbac import Rol
from models.asignacion import Asignacion
from schemas.auditoria import AuditoriaFiltro, AuditoriaRespuesta, AuditoriaRegistro, AuditoriaMetricas, MetricaDiaria, MetricaUsuario

class AuditoriaService:
    def __init__(self, db: AsyncSession, tenant_id: UUID, current_user: Usuario):
        self.db = db
        self.tenant_id = tenant_id
        self.current_user = current_user

    async def _get_base_query(self):
        query = select(AuditLog).where(AuditLog.tenant_id == self.tenant_id)
        
        # Scope por rol
        # Si es Admin o Finanzas, ve todo.
        # Si es Coordinador, ve sus acciones y las acciones que tengan que ver con usuarios asignados a materias de sus instancias?
        # Para el MVP, el coordinador solo ve acciones donde el 'usuario_id' es él mismo O donde 'entidad' es Asignacion y le pertenece a su grupo de alumnos?
        # En la práctica, vamos a simplificar: Si es coordinador, restringimos por usuario_id = él mismo. 
        # O en un escenario más avanzado, join con Asignacion.
        # Según spec: "únicamente observe registros relacionados a los usuarios asignados a las materias donde actúa como coordinador, o sus propias acciones."
        
        roles_globales = ["ADMIN", "FINANZAS"]
        user_roles = self.current_user.roles
        es_global = any(r in roles_globales for r in user_roles)
        
        if not es_global and "COORDINADOR" in user_roles:
            # Obtener usuarios que están en las instancias donde este usuario es coordinador
            # Subquery simplificada (sino, muy pesada)
            query_materias = select(Asignacion.materia_id).where(
                Asignacion.tenant_id == self.tenant_id,
                Asignacion.usuario_id == self.current_user.id,
                Asignacion.rol_id == select(Rol.id).where(Rol.nombre == "COORDINADOR").scalar_subquery()
            )
            materias_ids = (await self.db.execute(query_materias)).scalars().all()
            
            if materias_ids:
                # Buscar usuarios asignados a estas instancias
                query_users_scope = select(Asignacion.usuario_id).where(
                    Asignacion.tenant_id == self.tenant_id,
                    Asignacion.materia_id.in_(materias_ids)
                )
                users_scope = (await self.db.execute(query_users_scope)).scalars().all()
                users_scope.append(self.current_user.id) # Siempre ver lo propio
                
                query = query.where(AuditLog.usuario_id.in_(users_scope))
            else:
                # Solo ve lo suyo si no tiene asignaciones
                query = query.where(AuditLog.usuario_id == self.current_user.id)
                
        return query

    async def obtener_ultimas_acciones(self, limit: int = 200, offset: int = 0) -> AuditoriaRespuesta:
        query = await self._get_base_query()
        
        # Total
        query_count = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(query_count)).scalar_one()
        
        # Paginated
        query_pag = query.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
        logs = (await self.db.execute(query_pag)).scalars().all()
        
        items = [AuditoriaRegistro.model_validate(log, from_attributes=True) for log in logs]
        return AuditoriaRespuesta(total=total, limit=limit, offset=offset, items=items)

    async def explorar_logs(self, filtro: AuditoriaFiltro) -> AuditoriaRespuesta:
        query = await self._get_base_query()
        
        if filtro.fecha_desde:
            query = query.where(AuditLog.created_at >= filtro.fecha_desde)
        if filtro.fecha_hasta:
            query = query.where(AuditLog.created_at <= filtro.fecha_hasta)
        if filtro.usuario_id:
            query = query.where(AuditLog.usuario_id == filtro.usuario_id)
        if filtro.accion:
            query = query.where(AuditLog.accion == filtro.accion)
        if filtro.entidad:
            query = query.where(AuditLog.entidad == filtro.entidad)
        if filtro.entidad_id:
            query = query.where(AuditLog.entidad_id == filtro.entidad_id)
            
        # Total
        query_count = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(query_count)).scalar_one()
        
        # Sort and paginate
        query_pag = query.order_by(AuditLog.fecha_hora.desc()).limit(filtro.limit).offset(filtro.offset)
        logs = (await self.db.execute(query_pag)).scalars().all()
        
        items = [AuditoriaRegistro.model_validate(log, from_attributes=True) for log in logs]
        return AuditoriaRespuesta(total=total, limit=filtro.limit, offset=filtro.offset, items=items)

    async def obtener_metricas_interacciones(self) -> AuditoriaMetricas:
        query = await self._get_base_query()
        
        # 1. Agrupado por día
        query_dia = select(
            cast(AuditLog.created_at, String).label('fecha'),
            func.count().label('cantidad')
        ).select_from(query.subquery()).group_by('fecha').order_by('fecha')
        
        rows_dia = (await self.db.execute(query_dia)).all()
        # Mapear, extraemos solo la parte YYYY-MM-DD
        por_dia = []
        for row in rows_dia:
            # Postgres cast a String puede traer "2026-06-07 10:00:00"
            fecha_corta = row.fecha[:10]
            # Simplificamos: si hay duplicados los acumulamos (en python o db)
            # Para MVP usamos este mapping básico
            por_dia.append(MetricaDiaria(fecha=fecha_corta, cantidad=row.cantidad))
            
        # 2. Comunicaciones agrupadas por usuario y "estado"
        # En AuditLog, si accion = COMUNICACION_ENVIADA o COMUNICACION_FALLIDA, 
        # asumiendo que está en el log.
        query_usr = select(
            AuditLog.usuario_id,
            AuditLog.accion.label('estado'),
            func.count().label('cantidad')
        ).select_from(query.subquery()).where(
            AuditLog.accion.like('COMUNICACION_%')
        ).group_by(AuditLog.usuario_id, AuditLog.accion)
        
        rows_usr = (await self.db.execute(query_usr)).all()
        por_usuario = [MetricaUsuario(usuario_id=row.usuario_id, estado=row.estado, cantidad=row.cantidad) for row in rows_usr]

        return AuditoriaMetricas(por_dia=por_dia, por_usuario=por_usuario)
