from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.evaluacion import EvaluacionCreate, EvaluacionResponse, ReservaImport, ReservaResponse, ResultadoCreate, ResultadoResponse, EvaluacionMetrics
from services.evaluaciones import EvaluacionService

router = APIRouter()

@router.post("/", response_model=EvaluacionResponse, status_code=status.HTTP_201_CREATED)
async def crear_evaluacion(
    data: EvaluacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluaciones:gestionar"))
):
    service = EvaluacionService(db, current_user.tenant_id)
    return await service.crear_evaluacion(data)

@router.get("/", response_model=List[EvaluacionResponse])
async def listar_evaluaciones(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluaciones:leer"))
):
    service = EvaluacionService(db, current_user.tenant_id)
    return await service.listar_globales()

@router.post("/{evaluacion_id}/reservas/importar", response_model=List[ReservaResponse])
async def importar_reservas(
    evaluacion_id: UUID,
    data: ReservaImport,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluaciones:gestionar"))
):
    service = EvaluacionService(db, current_user.tenant_id)
    return await service.importar_reservas(evaluacion_id, data)

@router.post("/{evaluacion_id}/resultados", response_model=List[ResultadoResponse])
async def registrar_resultados(
    evaluacion_id: UUID,
    resultados: List[ResultadoCreate],
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluaciones:gestionar"))
):
    service = EvaluacionService(db, current_user.tenant_id)
    return await service.registrar_resultados(evaluacion_id, resultados)

@router.get("/{evaluacion_id}/metricas", response_model=EvaluacionMetrics)
async def obtener_metricas(
    evaluacion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("evaluaciones:leer"))
):
    service = EvaluacionService(db, current_user.tenant_id)
    return await service.obtener_metricas(evaluacion_id)
