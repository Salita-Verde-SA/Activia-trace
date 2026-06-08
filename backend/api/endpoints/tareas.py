from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from models.tareas import EstadoTarea
from schemas.tarea import (
    TareaCreate, TareaResponse, TareaUpdateEstado, 
    ComentarioTareaCreate, ComentarioTareaResponse
)
from services.tareas import TareaService

router = APIRouter()

@router.post("/", response_model=TareaResponse, status_code=status.HTTP_201_CREATED)
async def crear_tarea(
    data: TareaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:gestionar"))
):
    service = TareaService(db, current_user.tenant_id)
    return await service.crear_tarea(current_user.id, data)

@router.get("/mis-tareas", response_model=List[TareaResponse])
async def listar_mis_tareas(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:leer_propias"))
):
    service = TareaService(db, current_user.tenant_id)
    return await service.listar_mis_tareas(current_user.id)

@router.get("/globales", response_model=List[TareaResponse])
async def listar_globales(
    asignado_a: Optional[UUID] = Query(None),
    estado: Optional[EstadoTarea] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:gestionar_global"))
):
    service = TareaService(db, current_user.tenant_id)
    return await service.listar_globales(asignado_a, estado)

@router.patch("/{tarea_id}/estado", response_model=TareaResponse)
async def cambiar_estado(
    tarea_id: UUID,
    data: TareaUpdateEstado,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:leer_propias")) # O "tareas:gestionar_global" si es admin. El service podría chequear si le pertenece, por simplicidad asumimos que tiene acceso
):
    service = TareaService(db, current_user.tenant_id)
    return await service.cambiar_estado(current_user.id, tarea_id, data)

@router.post("/{tarea_id}/comentarios", response_model=ComentarioTareaResponse, status_code=status.HTTP_201_CREATED)
async def agregar_comentario(
    tarea_id: UUID,
    data: ComentarioTareaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:leer_propias"))
):
    service = TareaService(db, current_user.tenant_id)
    return await service.agregar_comentario(current_user.id, tarea_id, data)

@router.get("/{tarea_id}/comentarios", response_model=List[ComentarioTareaResponse])
async def listar_comentarios(
    tarea_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("tareas:leer_propias"))
):
    service = TareaService(db, current_user.tenant_id)
    return await service.listar_comentarios(tarea_id)
