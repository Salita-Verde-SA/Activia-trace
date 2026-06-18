from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from pydantic import BaseModel

from core.dependencies import get_db
from api.dependencies.auth import get_current_user
from models.user import Usuario
from schemas.mensajeria_interna import (
    HiloCreate, MensajeInternoCreate, HiloResponse,
    MensajeInternoResponse, HiloListResponse
)
from services.mensajeria_interna import MensajeriaInternoService

router = APIRouter()


class UsuarioMensajeriaResponse(BaseModel):
    id: UUID
    nombre: str
    apellido: str

    class Config:
        from_attributes = True


@router.get("/usuarios-tenant", response_model=List[UsuarioMensajeriaResponse])
async def listar_usuarios_tenant(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    q = select(Usuario).where(
        Usuario.tenant_id == current_user.tenant_id,
        Usuario.deleted_at.is_(None),
        Usuario.activo == True,
        Usuario.id != current_user.id,
    ).order_by(Usuario.apellido, Usuario.nombre)
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/inbox", response_model=List[HiloListResponse])
async def listar_bandeja_entrada(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.listar_bandeja_entrada(limit, offset)

@router.get("/no-leidos", response_model=int)
async def contar_no_leidos_global(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.contar_no_leidos_global()

@router.post("/hilos", response_model=HiloResponse)
async def iniciar_hilo(
    data: HiloCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.iniciar_hilo(data)

@router.get("/hilos/{hilo_id}", response_model=HiloResponse)
async def obtener_hilo(
    hilo_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.obtener_mensajes_hilo(hilo_id)

@router.post("/hilos/{hilo_id}/mensajes", response_model=MensajeInternoResponse)
async def responder_hilo(
    data: MensajeInternoCreate,
    hilo_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.responder_hilo(hilo_id, data)
