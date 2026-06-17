from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.analisis import ReporteAtrasadosResponse, RankingActividadesResponse, SabanaResponse
from services.analisis import AnalisisService

router = APIRouter(tags=["analisis"])

@router.get("/materias/{materia_id}/atrasados", response_model=ReporteAtrasadosResponse)
async def reporte_atrasados(
    materia_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:leer"))
) -> Any:
    reporte = await AnalisisService.obtener_alumnos_atrasados(db, actor.tenant_id, materia_id)
    return reporte

@router.get("/materias/{materia_id}/ranking", response_model=RankingActividadesResponse)
async def ranking_actividades(
    materia_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:leer"))
) -> Any:
    ranking = await AnalisisService.obtener_ranking_actividades(db, actor.tenant_id, materia_id)
    return ranking

@router.get("/materias/{materia_id}/sabana", response_model=SabanaResponse)
async def sabana_notas(
    materia_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:leer"))
) -> Any:
    sabana = await AnalisisService.obtener_sabana_notas(db, actor.tenant_id, materia_id)
    return sabana
