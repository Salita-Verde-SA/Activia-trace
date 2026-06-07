import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from schemas.asignacion import (
    AsignacionResponse, AsignacionMasivaCreate, ClonadoEquipoRequest, AsignacionVigenciaUpdate, EquipoDocenteView
)
from services.asignacion import AsignacionService

router = APIRouter(prefix="/equipos", tags=["Equipos Docentes"])

@router.post("/asignacion-masiva", response_model=list[AsignacionResponse], status_code=status.HTTP_201_CREATED)
async def asignacion_masiva(
    data: AsignacionMasivaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("equipos:asignar"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.asignar_bloque(data, current_user.id)

@router.post("/clonar", response_model=list[AsignacionResponse], status_code=status.HTTP_201_CREATED)
async def clonar_equipo(
    data: ClonadoEquipoRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("equipos:asignar"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.clonar_equipo(data, current_user.id)

@router.patch("/vigencia", response_model=list[AsignacionResponse])
async def modificar_vigencia(
    data: AsignacionVigenciaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("equipos:asignar"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.modificar_vigencia_equipo(data, current_user.id)

@router.get("/mis-equipos", response_model=list[AsignacionResponse])
async def mis_equipos(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    # Requiere permisos básicos de lectura
    _=Depends(require_permission("equipos:leer_propios"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    return await service.get_asignaciones_by_usuario(current_user.id)

@router.get("/exportar", response_model=list[AsignacionResponse])
async def exportar_equipo(
    cohorte_id: uuid.UUID,
    materia_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("equipos:leer"))
):
    service = AsignacionService(db, str(current_user.tenant_id))
    # Para la exportación, podemos retornar la lista cruda o crear una lógica de export.
    # Por el momento retornamos JSON
    from sqlalchemy import select
    from models.asignacion import Asignacion
    stmt = select(Asignacion).where(
        Asignacion.tenant_id == current_user.tenant_id,
        Asignacion.cohorte_id == cohorte_id,
        Asignacion.deleted_at.is_(None)
    )
    if materia_id:
        stmt = stmt.where(Asignacion.materia_id == materia_id)
        
    result = await db.execute(stmt)
    return list(result.scalars().all())
