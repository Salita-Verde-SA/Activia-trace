import os
from typing import Sequence
import uuid
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_tenant
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from schemas.programas import ProgramaMateriaCreate, ProgramaMateriaUpdate, ProgramaMateriaResponse
from services.programas import ProgramaMateriaService

router = APIRouter(prefix="/api/programas", tags=["Programas Materia"])

UPLOAD_DIR = "uploads/programas"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/materia/{materia_id}", response_model=Sequence[ProgramaMateriaResponse], dependencies=[Depends(require_permission("estructura:gestionar"))])
async def get_programas_by_materia(
    materia_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    return await service.get_by_materia(materia_id)

@router.get("/{id}", response_model=ProgramaMateriaResponse)
async def get_programa(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    return await service.get_by_id(id)

@router.post("", response_model=ProgramaMateriaResponse, status_code=status.HTTP_201_CREATED)
async def create_programa(
    data: ProgramaMateriaCreate,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    return await service.create(data)

@router.patch("/{id}", response_model=ProgramaMateriaResponse)
async def update_programa(
    id: uuid.UUID,
    data: ProgramaMateriaUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    return await service.update(id, data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def delete_programa(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    await service.delete(id)

@router.post("/upload", response_model=ProgramaMateriaResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("estructura:gestionar"))])
async def upload_programa(
    materia_id: uuid.UUID = Form(...),
    carrera_id: uuid.UUID = Form(None),
    cohorte_id: uuid.UUID = Form(None),
    version: str = Form(None),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
        
    data = ProgramaMateriaCreate(
        materia_id=materia_id,
        carrera_id=carrera_id,
        cohorte_id=cohorte_id,
        referencia_archivo=filepath,
        version=version
    )
    
    service = ProgramaMateriaService(session, current_user.tenant_id)
    return await service.create(data)

@router.get("/{id}/archivo", response_class=FileResponse)
async def descargar_programa(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("estructura:gestionar"))
):
    service = ProgramaMateriaService(session, current_user.tenant_id)
    programa = await service.get_by_id(id)
    
    if not programa or not programa.referencia_archivo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado")
        
    filename = f"programa_{programa.materia_id}.pdf"
    if programa.version:
        filename = f"programa_{programa.materia_id}_v{programa.version}.pdf"
        
    return FileResponse(programa.referencia_archivo, media_type="application/pdf", filename=filename)
