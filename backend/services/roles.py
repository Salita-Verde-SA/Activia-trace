from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.rbac import Rol
import uuid

class RolService:
    def __init__(self, db: AsyncSession, tenant_id: str):
        self.db = db
        self.tenant_id = uuid.UUID(tenant_id)

    async def get_roles(self):
        stmt = select(Rol).where(Rol.tenant_id == self.tenant_id, Rol.deleted_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalars().all()
