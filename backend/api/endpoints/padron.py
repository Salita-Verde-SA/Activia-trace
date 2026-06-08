from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.padron import VersionPadronResponse
from services.padron import PadronService
from integrations.moodle_ws import MoodleClient
from core.config import settings

router = APIRouter(prefix="/padron", tags=["padron"])

@router.post("/importar-manual", response_model=VersionPadronResponse)
async def importar_manual(
    materia_id: uuid.UUID = Form(...),
    cohorte_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("padron:gestionar"))
) -> Any:
    """
    Importa manualmente un padrón desde un archivo CSV.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se soportan archivos CSV por el momento.")
        
    content = await file.read()
    version = await PadronService.importar_manual_csv(
        db=db,
        tenant_id=actor.tenant_id,
        actor_id=actor.id,
        materia_id=materia_id,
        cohorte_id=cohorte_id,
        file_content=content
    )
    return version

@router.post("/sincronizar-moodle", response_model=VersionPadronResponse)
async def sincronizar_moodle(
    materia_id: uuid.UUID,
    cohorte_id: uuid.UUID,
    moodle_course_id: int,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("padron:gestionar"))
) -> Any:
    """
    Sincroniza el padrón consultando el Web Service de Moodle.
    """
    moodle_url = settings.MOODLE_URL
    moodle_token = settings.MOODLE_TOKEN
    
    if not moodle_url or not moodle_token:
        raise HTTPException(status_code=500, detail="La integración con Moodle no está configurada")
        
    client = MoodleClient(base_url=moodle_url, token=moodle_token)
    
    version = await PadronService.sincronizar_moodle(
        db=db,
        tenant_id=actor.tenant_id,
        actor_id=actor.id,
        materia_id=materia_id,
        cohorte_id=cohorte_id,
        moodle_course_id=moodle_course_id,
        moodle_client=client
    )
    return version

@router.delete("/vaciar", response_model=dict)
async def vaciar_padron(
    materia_id: uuid.UUID,
    cohorte_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("padron:gestionar"))
) -> Any:
    """
    Vacía todas las entradas y versiones del padrón para una materia y cohorte dadas.
    """
    eliminados = await PadronService.vaciar_padron(
        db=db,
        tenant_id=actor.tenant_id,
        actor_id=actor.id,
        materia_id=materia_id,
        cohorte_id=cohorte_id
    )
    return {"status": "success", "versiones_eliminadas": eliminados}
