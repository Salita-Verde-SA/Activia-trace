from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import get_current_user, require_permission
from models.usuario import Usuario
from schemas.encuentro import SlotEncuentroCreate, InstanciaEncuentroUpdate, InstanciaEncuentroResponse
from services.encuentros import EncuentroService

router = APIRouter()

@router.post("/asignaciones/{asignacion_id}/encuentros", status_code=status.HTTP_201_CREATED)
async def crear_encuentro(
    asignacion_id: UUID,
    data: SlotEncuentroCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("encuentros:gestionar"))
):
    service = EncuentroService(db, current_user.tenant_id)
    return await service.crear_encuentro(asignacion_id, data)

@router.patch("/instancias-encuentros/{instancia_id}", response_model=InstanciaEncuentroResponse)
async def editar_instancia(
    instancia_id: UUID,
    data: InstanciaEncuentroUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("encuentros:gestionar"))
):
    service = EncuentroService(db, current_user.tenant_id)
    return await service.editar_instancia(instancia_id, data)

@router.get("/materias/{materia_id}/encuentros/html", response_class=HTMLResponse)
async def exportar_encuentros_html(
    materia_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("encuentros:gestionar"))
):
    service = EncuentroService(db, current_user.tenant_id)
    html = await service.generar_html_moodle(materia_id)
    return HTMLResponse(content=html)
