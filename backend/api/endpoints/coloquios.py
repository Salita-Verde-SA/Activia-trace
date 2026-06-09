from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.coloquio import ColoquioDisponible, ReservaColoquioRequest, ReservaColoquioResponse
from services.coloquios import ColoquioService

router = APIRouter()

@router.get("/disponibles", response_model=List[ColoquioDisponible])
async def listar_disponibles(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.listar_disponibles()

@router.post("/reservar", response_model=ReservaColoquioResponse, status_code=status.HTTP_201_CREATED)
async def reservar_coloquio(
    data: ReservaColoquioRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.reservar_coloquio(current_user.id, data)

@router.post("/reservas/{reserva_id}/cancelar", status_code=status.HTTP_204_NO_CONTENT)
async def cancelar_reserva(
    reserva_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    await service.cancelar_reserva(current_user.id, reserva_id)
