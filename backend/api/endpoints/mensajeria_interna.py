from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from api.dependencies import get_db, require_auth
from models.user import Usuario
from schemas.mensajeria_interna import (
    HiloCreate, MensajeInternoCreate, HiloResponse, 
    MensajeInternoResponse, HiloListResponse
)
from services.mensajeria_interna import MensajeriaInternoService

router = APIRouter()

@router.get("/inbox", response_model=List[HiloListResponse])
async def listar_bandeja_entrada(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.listar_bandeja_entrada(limit, offset)

@router.get("/no-leidos", response_model=int)
async def contar_no_leidos_global(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.contar_no_leidos_global()

@router.post("/hilos", response_model=HiloResponse)
async def iniciar_hilo(
    data: HiloCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.iniciar_hilo(data)

@router.get("/hilos/{hilo_id}", response_model=HiloResponse)
async def obtener_hilo(
    hilo_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.obtener_mensajes_hilo(hilo_id)

@router.post("/hilos/{hilo_id}/mensajes", response_model=MensajeInternoResponse)
async def responder_hilo(
    data: MensajeInternoCreate,
    hilo_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = MensajeriaInternoService(db, current_user.tenant_id, current_user)
    return await service.responder_hilo(hilo_id, data)
