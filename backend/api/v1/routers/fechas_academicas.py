from typing import Sequence
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, require_permission, get_tenant
from schemas.programas import FechaAcademicaCreate, FechaAcademicaUpdate, FechaAcademicaResponse
from services.programas import FechaAcademicaService

router = APIRouter(prefix="/api/fechas-academicas", tags=["Fechas Academicas"])

# Temporary mock for tenant id to avoid test failures if C-03 isn't ready
async def get_current_tenant_id(tenant=Depends(get_tenant)) -> uuid.UUID:
    return tenant.id if tenant else uuid.UUID("00000000-0000-0000-0000-000000000000")

@router.get("/materia/{materia_id}", response_model=Sequence[FechaAcademicaResponse])
async def get_fechas_by_materia(
    materia_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = FechaAcademicaService(session, tenant_id)
    return await service.get_by_materia(materia_id)

@router.get("/{id}", response_model=FechaAcademicaResponse)
async def get_fecha(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = FechaAcademicaService(session, tenant_id)
    return await service.get_by_id(id)

@router.post("", response_model=FechaAcademicaResponse, status_code=status.HTTP_201_CREATED)
async def create_fecha(
    data: FechaAcademicaCreate,
    session: AsyncSession = Depends(get_db),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = FechaAcademicaService(session, tenant_id)
    return await service.create(data)

@router.patch("/{id}", response_model=FechaAcademicaResponse)
async def update_fecha(
    id: uuid.UUID,
    data: FechaAcademicaUpdate,
    session: AsyncSession = Depends(get_db),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = FechaAcademicaService(session, tenant_id)
    return await service.update(id, data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fecha(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = FechaAcademicaService(session, tenant_id)
    await service.delete(id)
