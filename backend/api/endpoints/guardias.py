from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date

from core.dependencies import get_db
from api.dependencies.auth import get_current_user, require_permission
from models.user import Usuario
from schemas.guardia import GuardiaCreate, GuardiaResponse
from services.encuentros import GuardiaService

router = APIRouter()

@router.post("/asignaciones/{asignacion_id}/guardias", response_model=GuardiaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_guardia(
    asignacion_id: UUID,
    data: GuardiaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("encuentros:gestionar"))
):
    service = GuardiaService(db, current_user.tenant_id)
    return await service.registrar_guardia(asignacion_id, data)

@router.get("/guardias", response_model=List[GuardiaResponse])
async def exportar_guardias(
    fecha_desde: date = Query(...),
    fecha_hasta: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("encuentros:gestionar"))
):
    service = GuardiaService(db, current_user.tenant_id)
    return await service.exportar_guardias(fecha_desde, fecha_hasta)
