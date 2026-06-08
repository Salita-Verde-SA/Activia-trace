from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db, require_auth
from models.user import Usuario
from schemas.usuario import UsuarioResponse, UsuarioPerfilUpdate
from services.usuario import UsuarioService

router = APIRouter()

@router.put("/me", response_model=UsuarioResponse)
async def actualizar_mi_perfil(
    data: UsuarioPerfilUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_auth)
):
    service = UsuarioService(db, str(current_user.tenant_id))
    updated_user = await service.actualizar_perfil(current_user.id, data)
    return updated_user
