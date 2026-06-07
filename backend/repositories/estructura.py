import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.base import BaseRepository
from models.estructura import Carrera, Cohorte, Materia

class CarreraRepository(BaseRepository[Carrera]):
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(Carrera, db, tenant_id)

    async def get_by_codigo(self, codigo: str) -> Carrera | None:
        stmt = select(Carrera).where(
            Carrera.tenant_id == self.tenant_id,
            Carrera.codigo == codigo
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

class CohorteRepository(BaseRepository[Cohorte]):
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(Cohorte, db, tenant_id)
        
    async def get_by_carrera_and_nombre(self, carrera_id: uuid.UUID, nombre: str) -> Cohorte | None:
        stmt = select(Cohorte).where(
            Cohorte.tenant_id == self.tenant_id,
            Cohorte.carrera_id == carrera_id,
            Cohorte.nombre == nombre
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

class MateriaRepository(BaseRepository[Materia]):
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(Materia, db, tenant_id)

    async def get_by_codigo(self, codigo: str) -> Materia | None:
        stmt = select(Materia).where(
            Materia.tenant_id == self.tenant_id,
            Materia.codigo == codigo
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
