from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
from uuid import UUID

from api.dependencies import get_db, require_permission
from models.user import Usuario
from schemas.auditoria import AuditoriaFiltro, AuditoriaRespuesta, AuditoriaMetricas
from services.auditoria import AuditoriaService

router = APIRouter()

@router.get("/metricas", response_model=AuditoriaMetricas)
async def obtener_metricas(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("auditoria:ver"))
):
    service = AuditoriaService(db, current_user.tenant_id, current_user)
    return await service.obtener_metricas_interacciones()

@router.get("/ultimas", response_model=AuditoriaRespuesta)
async def obtener_ultimas_acciones(
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("auditoria:ver"))
):
    service = AuditoriaService(db, current_user.tenant_id, current_user)
    return await service.obtener_ultimas_acciones(limit, offset)

@router.get("/explorar", response_model=AuditoriaRespuesta)
async def explorar_logs(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    usuario_id: Optional[UUID] = Query(None),
    accion: Optional[str] = Query(None),
    entidad: Optional[str] = Query(None),
    entidad_id: Optional[UUID] = Query(None),
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("auditoria:ver"))
):
    filtro = AuditoriaFiltro(
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        usuario_id=usuario_id,
        accion=accion,
        entidad=entidad,
        entidad_id=entidad_id,
        limit=limit,
        offset=offset
    )
    service = AuditoriaService(db, current_user.tenant_id, current_user)
    return await service.explorar_logs(filtro)
