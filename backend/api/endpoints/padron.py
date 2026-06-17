from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
import uuid
from pydantic import BaseModel

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from models.padron import VersionPadron
from models.estructura import Materia, Cohorte
from schemas.padron import VersionPadronResponse, PadronActivoItem
from services.padron import PadronService
from integrations.moodle_ws import MoodleClient
from core.config import settings


class CatalogoItem(BaseModel):
    id: uuid.UUID
    nombre: str

class CatalogoPadronResponse(BaseModel):
    materias: List[CatalogoItem]
    cohortes: List[CatalogoItem]

router = APIRouter(prefix="/padron", tags=["padron"])

@router.post("/importar-manual", response_model=VersionPadronResponse)
async def importar_manual(
    materia_id: uuid.UUID = Form(...),
    cohorte_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:importar"))
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

@router.get("/activos", response_model=List[PadronActivoItem])
async def listar_padrones_activos(
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:importar"))
) -> Any:
    versiones_result = await db.execute(
        select(VersionPadron).where(
            VersionPadron.tenant_id == actor.tenant_id,
            VersionPadron.activa == True,
            VersionPadron.deleted_at.is_(None),
        )
    )
    versiones = versiones_result.scalars().all()
    if not versiones:
        return []

    materia_ids = list({v.materia_id for v in versiones})
    cohorte_ids = list({v.cohorte_id for v in versiones})

    materias_result = await db.execute(select(Materia).where(Materia.id.in_(materia_ids)))
    materias = {m.id: m.nombre for m in materias_result.scalars().all()}

    cohortes_result = await db.execute(select(Cohorte).where(Cohorte.id.in_(cohorte_ids)))
    cohortes = {c.id: c.nombre for c in cohortes_result.scalars().all()}

    return [
        PadronActivoItem(
            version_padron_id=v.id,
            materia_id=v.materia_id,
            materia_nombre=materias.get(v.materia_id, str(v.materia_id)),
            cohorte_id=v.cohorte_id,
            cohorte_nombre=cohortes.get(v.cohorte_id, str(v.cohorte_id)),
        )
        for v in versiones
    ]

@router.get("/catalogo", response_model=CatalogoPadronResponse)
async def catalogo_padron(
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("calificaciones:importar"))
) -> Any:
    from models.estructura import EstadoEstructura
    materias_result = await db.execute(
        select(Materia).where(
            Materia.tenant_id == actor.tenant_id,
            Materia.estado == EstadoEstructura.ACTIVA,
        )
    )
    cohortes_result = await db.execute(
        select(Cohorte).where(
            Cohorte.tenant_id == actor.tenant_id,
            Cohorte.estado == EstadoEstructura.ACTIVA,
        )
    )
    materias = [CatalogoItem(id=m.id, nombre=m.nombre) for m in materias_result.scalars().all()]
    cohortes = [CatalogoItem(id=c.id, nombre=c.nombre) for c in cohortes_result.scalars().all()]
    return CatalogoPadronResponse(materias=materias, cohortes=cohortes)

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
