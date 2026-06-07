import uuid
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from api.dependencies.auth import get_current_user, CurrentUser, require_permission
from schemas.materia import MateriaCreate, MateriaUpdate, MateriaResponse
from services.estructura import EstructuraService

router = APIRouter(prefix="/materias", tags=["Admin / Materias"])

@router.post("", response_model=MateriaResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def create_materia(
    request: Request,
    schema: MateriaCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.create_materia(request, current_user, schema)

@router.get("", response_model=list[MateriaResponse], dependencies=[Depends(require_permission("estructura:gestionar"))])
async def list_materias(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.list_materias(skip, limit)

@router.get("/{id}", response_model=MateriaResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_materia(
    id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.get_materia(id)

@router.patch("/{id}", response_model=MateriaResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def update_materia(
    request: Request,
    id: uuid.UUID,
    schema: MateriaUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.update_materia(request, current_user, id, schema)
