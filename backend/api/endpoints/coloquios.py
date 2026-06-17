from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.coloquio import ColoquioDisponible, ReservaColoquioRequest, ReservaColoquioResponse
from services.coloquios import ColoquioService

router = APIRouter()

@router.get("/convocatorias", status_code=status.HTTP_200_OK)
async def listar_convocatorias(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.listar_convocatorias()

from pydantic import BaseModel
class AsignarPadronRequest(BaseModel):
    alumnos_ids: List[UUID]

@router.post("/convocatorias/{convocatoria_id}/padron", status_code=status.HTTP_201_CREATED)
async def asignar_padron(
    convocatoria_id: UUID,
    req: AsignarPadronRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    res = await service.asignar_candidatos_ids(convocatoria_id, req.alumnos_ids)
    return {"message": f"Asignados {res} candidatos exitosamente."}

@router.post("/convocatorias/{convocatoria_id}/padron/importar", status_code=status.HTTP_201_CREATED)
async def importar_padron_candidatos(
    convocatoria_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    content = await file.read()
    res = await service.importar_padron_candidatos(convocatoria_id, content)
    return {"message": f"Importados {res} candidatos exitosamente."}

@router.get("/convocatorias/{convocatoria_id}/agenda")
async def listar_agenda_reservas(
    convocatoria_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.listar_agenda_reservas(convocatoria_id)

from schemas.coloquio import ConvocatoriaColoquioCreate, ConvocatoriaColoquioResponse

@router.post("/convocatorias", response_model=ConvocatoriaColoquioResponse, status_code=status.HTTP_201_CREATED)
async def crear_convocatoria(
    data: ConvocatoriaColoquioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.crear_convocatoria(data)

@router.patch("/convocatorias/{convocatoria_id}/publicar", status_code=status.HTTP_200_OK)
async def publicar_convocatoria(
    convocatoria_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:gestionar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.publicar_convocatoria(convocatoria_id)

@router.get("/disponibles", response_model=List[ColoquioDisponible])
async def listar_disponibles(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.listar_disponibles(current_user.id)

@router.post("/reservar", response_model=ReservaColoquioResponse, status_code=status.HTTP_201_CREATED)
async def reservar_coloquio(
    data: ReservaColoquioRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    return await service.reservar_coloquio(current_user.id, data)

@router.post("/reservas/{reserva_id}/cancelar", status_code=status.HTTP_204_NO_CONTENT)
async def cancelar_reserva(
    reserva_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluacion:reservar"))
):
    service = ColoquioService(db, current_user.tenant_id)
    await service.cancelar_reserva(current_user.id, reserva_id)
