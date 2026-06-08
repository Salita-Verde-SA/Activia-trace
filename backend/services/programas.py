import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from repositories.programas import ProgramaMateriaRepository, FechaAcademicaRepository
from schemas.programas import (
    ProgramaMateriaCreate, ProgramaMateriaUpdate, 
    FechaAcademicaCreate, FechaAcademicaUpdate
)
from models.programas import ProgramaMateria, FechaAcademica
from repositories.estructura import MateriaRepository, CarreraRepository, CohorteRepository

class ProgramaMateriaService:
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        self.session = session
        self.tenant_id = tenant_id
        self.repo = ProgramaMateriaRepository(session, tenant_id)
        self.materia_repo = MateriaRepository(session, tenant_id)
        self.carrera_repo = CarreraRepository(session, tenant_id)
        self.cohorte_repo = CohorteRepository(session, tenant_id)

    async def _validate_relations(self, materia_id: uuid.UUID, carrera_id: uuid.UUID | None, cohorte_id: uuid.UUID | None):
        materia = await self.materia_repo.get_by_id(materia_id)
        if not materia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Materia no encontrada")
        
        if carrera_id:
            carrera = await self.carrera_repo.get_by_id(carrera_id)
            if not carrera:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrera no encontrada")
        
        if cohorte_id:
            cohorte = await self.cohorte_repo.get_by_id(cohorte_id)
            if not cohorte:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohorte no encontrada")

    async def get_by_materia(self, materia_id: uuid.UUID) -> Sequence[ProgramaMateria]:
        return await self.repo.get_by_materia(materia_id)

    async def get_by_id(self, id: uuid.UUID) -> ProgramaMateria:
        programa = await self.repo.get_by_id(id)
        if not programa:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programa no encontrado")
        return programa

    async def create(self, data: ProgramaMateriaCreate) -> ProgramaMateria:
        await self._validate_relations(data.materia_id, data.carrera_id, data.cohorte_id)
        
        programa = ProgramaMateria(
            materia_id=data.materia_id,
            carrera_id=data.carrera_id,
            cohorte_id=data.cohorte_id,
            referencia_archivo=data.referencia_archivo,
            version=data.version,
            tenant_id=self.tenant_id
        )
        self.session.add(programa)
        await self.session.flush()
        return programa

    async def update(self, id: uuid.UUID, data: ProgramaMateriaUpdate) -> ProgramaMateria:
        programa = await self.get_by_id(id)
        
        if data.materia_id or data.carrera_id or data.cohorte_id:
            m_id = data.materia_id or programa.materia_id
            c_id = data.carrera_id if data.carrera_id is not None else programa.carrera_id
            coh_id = data.cohorte_id if data.cohorte_id is not None else programa.cohorte_id
            await self._validate_relations(m_id, c_id, coh_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(programa, field, value)

        await self.session.flush()
        return programa

    async def delete(self, id: uuid.UUID) -> None:
        programa = await self.get_by_id(id)
        await self.repo.delete(programa)
        await self.session.flush()


class FechaAcademicaService:
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        self.session = session
        self.tenant_id = tenant_id
        self.repo = FechaAcademicaRepository(session, tenant_id)
        self.materia_repo = MateriaRepository(session, tenant_id)
        self.cohorte_repo = CohorteRepository(session, tenant_id)

    async def _validate_relations(self, materia_id: uuid.UUID, cohorte_id: uuid.UUID | None):
        materia = await self.materia_repo.get_by_id(materia_id)
        if not materia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Materia no encontrada")
        
        if cohorte_id:
            cohorte = await self.cohorte_repo.get_by_id(cohorte_id)
            if not cohorte:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohorte no encontrada")

    async def get_by_materia(self, materia_id: uuid.UUID) -> Sequence[FechaAcademica]:
        return await self.repo.get_by_materia(materia_id)

    async def get_by_id(self, id: uuid.UUID) -> FechaAcademica:
        fecha = await self.repo.get_by_id(id)
        if not fecha:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fecha académica no encontrada")
        return fecha

    async def create(self, data: FechaAcademicaCreate) -> FechaAcademica:
        await self._validate_relations(data.materia_id, data.cohorte_id)
        
        fecha = FechaAcademica(
            materia_id=data.materia_id,
            cohorte_id=data.cohorte_id,
            tipo=data.tipo,
            fecha=data.fecha,
            titulo=data.titulo,
            descripcion=data.descripcion,
            es_feriado=data.es_feriado,
            tenant_id=self.tenant_id
        )
        self.session.add(fecha)
        await self.session.flush()
        return fecha

    async def update(self, id: uuid.UUID, data: FechaAcademicaUpdate) -> FechaAcademica:
        fecha = await self.get_by_id(id)
        
        if data.materia_id or data.cohorte_id:
            m_id = data.materia_id or fecha.materia_id
            coh_id = data.cohorte_id if data.cohorte_id is not None else fecha.cohorte_id
            await self._validate_relations(m_id, coh_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(fecha, field, value)

        await self.session.flush()
        return fecha

    async def delete(self, id: uuid.UUID) -> None:
        fecha = await self.get_by_id(id)
        await self.repo.delete(fecha)
        await self.session.flush()
