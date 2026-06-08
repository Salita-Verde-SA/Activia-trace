import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from repositories.base import BaseRepository
from models.programas import ProgramaMateria, FechaAcademica

class ProgramaMateriaRepository(BaseRepository[ProgramaMateria]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(ProgramaMateria, session, tenant_id)

    async def get_by_materia(self, materia_id: uuid.UUID) -> Sequence[ProgramaMateria]:
        stmt = self._base_query().where(
            ProgramaMateria.materia_id == materia_id
        ).options(
            selectinload(ProgramaMateria.materia),
            selectinload(ProgramaMateria.carrera),
            selectinload(ProgramaMateria.cohorte)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

class FechaAcademicaRepository(BaseRepository[FechaAcademica]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(FechaAcademica, session, tenant_id)

    async def get_by_materia(self, materia_id: uuid.UUID) -> Sequence[FechaAcademica]:
        stmt = self._base_query().where(
            FechaAcademica.materia_id == materia_id
        ).options(
            selectinload(FechaAcademica.materia),
            selectinload(FechaAcademica.cohorte)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
