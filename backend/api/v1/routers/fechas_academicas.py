from typing import Sequence
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_tenant
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from schemas.programas import FechaAcademicaCreate, FechaAcademicaUpdate, FechaAcademicaResponse
from services.programas import FechaAcademicaService

router = APIRouter(prefix="/api/fechas-academicas", tags=["Fechas Academicas"])



@router.get("/materia/{materia_id}", response_model=Sequence[FechaAcademicaResponse], dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_fechas_by_materia(
    materia_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = FechaAcademicaService(session, current_user.tenant_id)
    return await service.get_by_materia(materia_id)

@router.get("/{id}", response_model=FechaAcademicaResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_fecha(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = FechaAcademicaService(session, current_user.tenant_id)
    return await service.get_by_id(id)

@router.post("", response_model=FechaAcademicaResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def create_fecha(
    data: FechaAcademicaCreate,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = FechaAcademicaService(session, current_user.tenant_id)
    return await service.create(data)

@router.patch("/{id}", response_model=FechaAcademicaResponse, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def update_fecha(
    id: uuid.UUID,
    data: FechaAcademicaUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = FechaAcademicaService(session, current_user.tenant_id)
    return await service.update(id, data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def delete_fecha(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = FechaAcademicaService(session, current_user.tenant_id)
    await service.delete(id)
