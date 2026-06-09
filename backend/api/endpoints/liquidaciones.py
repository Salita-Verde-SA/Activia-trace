from fastapi import APIRouter, Depends, status, Query
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from models.liquidaciones import Liquidacion, EstadoLiquidacion
from schemas.liquidacion import LiquidacionPrecalculo, LiquidacionResponse
from services.liquidaciones import LiquidacionService

router = APIRouter()

@router.get("", response_model=List[LiquidacionResponse])
async def obtener_liquidaciones(
    periodo_anio: Optional[int] = Query(None),
    periodo_mes: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("finanzas:liquidar"))
):
    service = LiquidacionService(db, current_user.tenant_id)
    if estado == "ABIERTA" and periodo_mes and periodo_anio:
        precalculos = await service.generar_pre_liquidaciones(periodo_mes, periodo_anio)
        res = []
        for p in precalculos:
            res.append(
                LiquidacionResponse(
                    id=p.usuario_id,  # Using usuario_id as the ID so frontend can close it
                    tenant_id=current_user.tenant_id,
                    estado=EstadoLiquidacion.ABIERTA,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                    **p.model_dump()
                )
            )
        return res
    else:
        query = select(Liquidacion).where(Liquidacion.tenant_id == current_user.tenant_id)
        if periodo_anio:
            query = query.where(Liquidacion.periodo_anio == periodo_anio)
        if periodo_mes:
            query = query.where(Liquidacion.periodo_mes == periodo_mes)
        if estado:
            query = query.where(Liquidacion.estado == estado)
        
        liquidaciones = (await db.execute(query)).scalars().all()
        return liquidaciones

@router.get("/pre-calculo", response_model=List[LiquidacionPrecalculo])
async def obtener_pre_liquidaciones(
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("finanzas:liquidar"))
):
    service = LiquidacionService(db, current_user.tenant_id)
    return await service.generar_pre_liquidaciones(mes, anio)

@router.post("/{usuario_id}/cerrar", response_model=LiquidacionResponse)
async def cerrar_liquidacion(
    usuario_id: UUID,
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("finanzas:liquidar"))
):
    service = LiquidacionService(db, current_user.tenant_id)
    return await service.cerrar_liquidacion_mensual(usuario_id, mes, anio, admin_id=current_user.id)
