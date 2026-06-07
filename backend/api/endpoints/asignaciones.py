import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from core.dependencies import get_db
from schemas.asignacion import AsignacionResponse, AsignacionCreate, AsignacionUpdate
from services.asignacion import AsignacionService

router = APIRouter(prefix="/asignaciones", tags=["Asignaciones"])

@router.post("/", response_model=AsignacionResponse, status_code=status.HTTP_201_CREATED)
async def create_asignacion(
    data: AsignacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("asignaciones:crear"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.create_asignacion(data)

@router.get("/usuario/{usuario_id}", response_model=list[AsignacionResponse])
async def list_asignaciones_by_usuario(
    usuario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("asignaciones:leer"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.get_asignaciones_by_usuario(usuario_id)

@router.get("/{asignacion_id}", response_model=AsignacionResponse)
async def get_asignacion(
    asignacion_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("asignaciones:leer"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.get_asignacion(asignacion_id)

@router.patch("/{asignacion_id}", response_model=AsignacionResponse)
async def update_asignacion(
    asignacion_id: uuid.UUID,
    data: AsignacionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("asignaciones:editar"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.update_asignacion(asignacion_id, data)

@router.delete("/{asignacion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asignacion(
    asignacion_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("asignaciones:eliminar"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    await service.delete_asignacion(asignacion_id)
