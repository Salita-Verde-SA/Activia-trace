import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from core.security.jwt import decode_access_token
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.dependencies import get_db
from models.rbac import Rol, Permiso, RolPermiso
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class CurrentUser(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    roles: list[str] = []
    impersonator_id: uuid.UUID | None = None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    """
    Dependencia central (Regla de oro de seguridad).
    Extrae la identidad y el tenant_id exclusivamente de la sesión (JWT).
    """
    try:
        payload = decode_access_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    user_id_str = payload.get("sub")
    tenant_id_str = payload.get("tenant_id")
    
    if user_id_str is None or tenant_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Convert to UUIDs
    try:
        user_id = uuid.UUID(user_id_str)
        tenant_id = uuid.UUID(tenant_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token UUIDs",
            headers={"WWW-Authenticate": "Bearer"},
        )

    roles = payload.get("roles", [])
    
    impersonator_id_str = payload.get("impersonator_id")
    impersonator_id = None
    if impersonator_id_str:
        try:
            impersonator_id = uuid.UUID(impersonator_id_str)
        except ValueError:
            pass # Invalid UUID for impersonator is ignored or could fail, but let's just leave it None or fail? Let's fail for security.
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid impersonator UUID",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return CurrentUser(
        id=user_id, 
        tenant_id=tenant_id, 
        roles=roles,
        impersonator_id=impersonator_id
    )

def require_permission(required_permission: str):
    """
    Inyector de dependencia para validar que el usuario tenga un permiso específico.
    Falla con 403 Forbidden si el usuario no cuenta con el permiso en su tenant actual.
    """
    async def permission_checker(
        current_user: CurrentUser = Depends(get_current_user),
        session: AsyncSession = Depends(get_db)
    ):
        from models.asignacion import Asignacion
        from datetime import datetime, timezone
        
        now = datetime.now(timezone.utc)
        query = (
            select(Permiso.id)
            .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
            .join(Rol, Rol.id == RolPermiso.rol_id)
            .join(Asignacion, Asignacion.rol_id == Rol.id)
            .where(
                Asignacion.usuario_id == current_user.id,
                Asignacion.tenant_id == current_user.tenant_id,
                Asignacion.deleted_at.is_(None),
                Asignacion.desde <= now,
                (Asignacion.hasta.is_(None) | (Asignacion.hasta >= now)),
                Rol.deleted_at.is_(None),
                Permiso.nombre == required_permission
            )
            .limit(1)
        )
        result = await session.execute(query)
        has_permission = result.scalar_one_or_none()
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {required_permission}"
            )
            
        return current_user
        
    return permission_checker
