from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from api.dependencies.auth import get_current_user, CurrentUser, require_permission
from schemas.rbac import RolResponse
from services.roles import RolService

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("/", response_model=list[RolResponse])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    service = RolService(db, str(current_user.tenant_id))
    return await service.get_roles()
