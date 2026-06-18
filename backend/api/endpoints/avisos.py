from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from models.avisos import AlcanceAviso, SeveridadAviso
from schemas.aviso import (
    AvisoCreate, AvisoResponse, AvisoAcknowledgmentCreate, AvisoMetrics, ContactarAlumnoRequest,
    AvisoAlumnoResponse
)
from services.avisos import AvisoService

router = APIRouter()

@router.post("/", response_model=AvisoResponse, status_code=status.HTTP_201_CREATED)
async def crear_aviso(
    data: AvisoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:publicar"))
):
    service = AvisoService(db, current_user.tenant_id)
    return await service.crear_aviso(data, actor_id=current_user.id)

@router.post("/contactar-alumno", response_model=AvisoResponse, status_code=status.HTTP_201_CREATED)
async def contactar_alumno(
    data: ContactarAlumnoRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:contactar_alumno"))
):
    """Contacta a un alumno en riesgo creando un aviso dirigido (in-app) a su perfil."""
    aviso = AvisoCreate(
        titulo=data.titulo,
        cuerpo=data.cuerpo,
        severidad=SeveridadAviso.WARNING,
        fecha_inicio=datetime.now(timezone.utc),
        requiere_ack=True,
        alcance=AlcanceAviso.USUARIO,
        usuario_id=data.usuario_id,
    )
    service = AvisoService(db, current_user.tenant_id)
    return await service.crear_aviso(aviso, actor_id=current_user.id)

@router.get("/", response_model=List[AvisoResponse])
async def listar_todos_avisos(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:publicar"))
):
    service = AvisoService(db, current_user.tenant_id)
    return await service.listar_todos()

@router.get("/mis-avisos", response_model=List[AvisoAlumnoResponse])
async def listar_mis_avisos(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:leer_propios"))
):
    service = AvisoService(db, current_user.tenant_id)
    return await service.listar_activos_para_usuario(current_user.id)

@router.post("/ack")
async def registrar_ack(
    data: AvisoAcknowledgmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:leer_propios"))
):
    service = AvisoService(db, current_user.tenant_id)
    return await service.registrar_acuse_recibo(current_user.id, data)

@router.get("/{aviso_id}/metricas", response_model=AvisoMetrics)
async def obtener_metricas(
    aviso_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("avisos:publicar"))
):
    service = AvisoService(db, current_user.tenant_id)
    return await service.obtener_metricas_aviso(aviso_id)
