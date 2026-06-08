from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid
import json

from api.deps import get_db, require_permission
from models.user import Usuario
from schemas.calificacion import UmbralCreate, UmbralResponse, PreviewResponse, ImportConfirmRequest, ColumnMap
from services.calificacion import UmbralService, CalificacionService

router = APIRouter(prefix="/calificaciones", tags=["calificaciones"])

@router.put("/umbral", response_model=UmbralResponse)
async def configurar_umbral(
    data: UmbralCreate,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:configurar"))
) -> Any:
    """
    Establece o actualiza el umbral de aprobación para una materia o asignación.
    """
    umbral = await UmbralService.set_umbral(
        db=db,
        tenant_id=actor.tenant_id,
        data=data
    )
    return umbral

@router.post("/importar/preview", response_model=PreviewResponse)
async def preview_importacion(
    file: UploadFile = File(...),
    actor: Usuario = Depends(require_permission("calificaciones:importar"))
) -> Any:
    """
    Recibe un archivo CSV, genera la vista previa y sugiere mapeos de columnas.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se soportan archivos CSV por el momento.")
        
    content = await file.read()
    preview = CalificacionService.generar_vista_previa(content)
    return preview

@router.post("/importar/confirm", response_model=dict)
async def confirmar_importacion(
    materia_id: uuid.UUID = Form(...),
    cohorte_id: uuid.UUID = Form(...),
    version_padron_id: uuid.UUID = Form(...),
    columnas_json: str = Form(...),
    es_reporte_finalizacion: bool = Form(False),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:importar"))
) -> Any:
    """
    Confirma la importación insertando las calificaciones en la base de datos.
    """
    try:
        columnas_dicts = json.loads(columnas_json)
        columnas = [ColumnMap(**c) for c in columnas_dicts]
    except Exception as e:
        raise HTTPException(status_code=400, detail="Formato de columnas_json inválido.")
        
    req = ImportConfirmRequest(
        materia_id=materia_id,
        cohorte_id=cohorte_id,
        version_padron_id=version_padron_id,
        columnas=columnas,
        es_reporte_finalizacion=es_reporte_finalizacion
    )
    
    content = await file.read()
    
    registros = await CalificacionService.confirmar_importacion(
        db=db,
        tenant_id=actor.tenant_id,
        actor_id=actor.id,
        data=req,
        file_content=content
    )
    
    return {"status": "success", "registros_importados": registros}
