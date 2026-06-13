import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from core.dependencies import get_db
from schemas.usuario import UsuarioResponse, UsuarioCreate, UsuarioUpdate
from services.usuario import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def create_usuario(
    data: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("usuarios:gestionar"))
):
    service = UsuarioService(db, str(current_user.tenant_id))
    return await service.create_usuario(data)

@router.get("/", response_model=list[UsuarioResponse])
async def list_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("usuarios:gestionar"))
):
    service = UsuarioService(db, str(current_user.tenant_id))
    return await service.get_usuarios(skip=skip, limit=limit)

@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(
    usuario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("usuarios:gestionar"))
):
    service = UsuarioService(db, str(current_user.tenant_id))
    return await service.get_usuario(usuario_id)

@router.patch("/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: uuid.UUID,
    data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("usuarios:gestionar"))
):
    service = UsuarioService(db, str(current_user.tenant_id))
    return await service.update_usuario(usuario_id, data)

@router.delete("/{usuario_id}", response_model=UsuarioResponse)
async def deactivate_usuario(
    usuario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    _=Depends(require_permission("usuarios:gestionar"))
):
    service = UsuarioService(db, str(current_user.tenant_id))
    return await service.deactivate_usuario(usuario_id)
