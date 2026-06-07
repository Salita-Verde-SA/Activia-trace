import uuid
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from api.dependencies.auth import get_current_user, CurrentUser, require_permission
from schemas.carrera import CarreraCreate, CarreraUpdate, CarreraResponse
from services.estructura import EstructuraService

router = APIRouter(prefix="/carreras", tags=["Admin / Carreras"])

@router.post("", response_model=CarreraResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def create_carrera(
    request: Request,
    schema: CarreraCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.create_carrera(request, current_user, schema)

@router.get("", response_model=list[CarreraResponse], dependencies=[Depends(require_permission("estructura:gestionar"))])
async def list_carreras(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.list_carreras(skip, limit)

@router.get("/{id}", response_model=CarreraResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_carrera(
    id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.get_carrera(id)

@router.patch("/{id}", response_model=CarreraResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def update_carrera(
    request: Request,
    id: uuid.UUID,
    schema: CarreraUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.update_carrera(request, current_user, id, schema)
