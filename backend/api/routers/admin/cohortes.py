import uuid
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from api.dependencies.auth import get_current_user, CurrentUser, require_permission
from schemas.cohorte import CohorteCreate, CohorteUpdate, CohorteResponse
from services.estructura import EstructuraService

router = APIRouter(prefix="/cohortes", tags=["Admin / Cohortes"])

@router.post("", response_model=CohorteResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def create_cohorte(
    request: Request,
    schema: CohorteCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.create_cohorte(request, current_user, schema)

@router.get("", response_model=list[CohorteResponse], dependencies=[Depends(require_permission("estructura:gestionar"))])
async def list_cohortes(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.list_cohortes(skip, limit)

@router.get("/{id}", response_model=CohorteResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_cohorte(
    id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.get_cohorte(id)

@router.patch("/{id}", response_model=CohorteResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def update_cohorte(
    request: Request,
    id: uuid.UUID,
    schema: CohorteUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EstructuraService(db, current_user.tenant_id)
    return await service.update_cohorte(request, current_user, id, schema)
