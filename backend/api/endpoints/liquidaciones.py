from fastapi import APIRouter, Depends, status, Query
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db, require_permission
from models.user import Usuario
from schemas.liquidacion import LiquidacionPrecalculo, LiquidacionResponse
from services.liquidaciones import LiquidacionService

router = APIRouter()

@router.get("/pre-calculo", response_model=List[LiquidacionPrecalculo])
async def obtener_pre_liquidaciones(
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:leer"))
):
    service = LiquidacionService(db, current_user.tenant_id)
    return await service.generar_pre_liquidaciones(mes, anio)

@router.post("/{usuario_id}/cerrar", response_model=LiquidacionResponse)
async def cerrar_liquidacion(
    usuario_id: UUID,
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:gestionar"))
):
    service = LiquidacionService(db, current_user.tenant_id)
    return await service.cerrar_liquidacion_mensual(usuario_id, mes, anio, admin_id=current_user.id)
