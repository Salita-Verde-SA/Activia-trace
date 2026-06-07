import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.base import BaseRepository
from models.asignacion import Asignacion

class AsignacionRepository(BaseRepository[Asignacion]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(Asignacion, session, tenant_id)
