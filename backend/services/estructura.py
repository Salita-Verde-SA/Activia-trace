import uuid
from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import CurrentUser
from core.audit import log_audit_event
from models.estructura import EstadoEstructura
from repositories.estructura import CarreraRepository, CohorteRepository, MateriaRepository
from schemas.carrera import CarreraCreate, CarreraUpdate
from schemas.cohorte import CohorteCreate, CohorteUpdate
from schemas.materia import MateriaCreate, MateriaUpdate

class EstructuraService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id
        self.carrera_repo = CarreraRepository(db, tenant_id)
        self.cohorte_repo = CohorteRepository(db, tenant_id)
        self.materia_repo = MateriaRepository(db, tenant_id)

    # --- CARRERA ---
    async def create_carrera(self, request: Request, current_user: CurrentUser, schema: CarreraCreate):
        if await self.carrera_repo.get_by_codigo(schema.codigo):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Carrera code already exists")
        
        carrera = await self.carrera_repo.create(**schema.model_dump())
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="CARRERA_CREAR", detalle={"id": str(carrera.id), "codigo": carrera.codigo}
        )
        await self.db.commit()
        await self.db.refresh(carrera)
        return carrera

    async def get_carrera(self, id: uuid.UUID):
        carrera = await self.carrera_repo.get(id)
        if not carrera:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrera not found")
        return carrera

    async def list_carreras(self, skip: int = 0, limit: int = 100):
        return await self.carrera_repo.list(skip=skip, limit=limit)

    async def update_carrera(self, request: Request, current_user: CurrentUser, id: uuid.UUID, schema: CarreraUpdate):
        carrera = await self.get_carrera(id)
        if schema.codigo and schema.codigo != carrera.codigo:
            if await self.carrera_repo.get_by_codigo(schema.codigo):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Carrera code already exists")
        
        updated_carrera = await self.carrera_repo.update(carrera.id, **schema.model_dump(exclude_unset=True))
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="CARRERA_MODIFICAR", detalle={"id": str(carrera.id)}
        )
        await self.db.commit()
        await self.db.refresh(updated_carrera)
        return updated_carrera

    # --- COHORTE ---
    async def create_cohorte(self, request: Request, current_user: CurrentUser, schema: CohorteCreate):
        carrera = await self.get_carrera(schema.carrera_id)
        if carrera.estado == EstadoEstructura.INACTIVA:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create cohorte in an inactive carrera")
            
        if await self.cohorte_repo.get_by_carrera_and_nombre(schema.carrera_id, schema.nombre):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cohorte name already exists for this carrera")
            
        cohorte = await self.cohorte_repo.create(**schema.model_dump())
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="COHORTE_CREAR", detalle={"id": str(cohorte.id), "carrera_id": str(carrera.id), "nombre": cohorte.nombre}
        )
        await self.db.commit()
        await self.db.refresh(cohorte)
        return cohorte

    async def get_cohorte(self, id: uuid.UUID):
        cohorte = await self.cohorte_repo.get(id)
        if not cohorte:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohorte not found")
        return cohorte

    async def list_cohortes(self, skip: int = 0, limit: int = 100):
        return await self.cohorte_repo.list(skip=skip, limit=limit)

    async def update_cohorte(self, request: Request, current_user: CurrentUser, id: uuid.UUID, schema: CohorteUpdate):
        cohorte = await self.get_cohorte(id)
        
        # Uniqueness check
        if schema.nombre and schema.nombre != cohorte.nombre:
            if await self.cohorte_repo.get_by_carrera_and_nombre(cohorte.carrera_id, schema.nombre):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cohorte name already exists for this carrera")
        
        updated_cohorte = await self.cohorte_repo.update(cohorte.id, **schema.model_dump(exclude_unset=True))
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="COHORTE_MODIFICAR", detalle={"id": str(cohorte.id)}
        )
        await self.db.commit()
        await self.db.refresh(updated_cohorte)
        return updated_cohorte

    # --- MATERIA ---
    async def create_materia(self, request: Request, current_user: CurrentUser, schema: MateriaCreate):
        if await self.materia_repo.get_by_codigo(schema.codigo):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Materia code already exists")
            
        materia = await self.materia_repo.create(**schema.model_dump())
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="MATERIA_CREAR", detalle={"id": str(materia.id), "codigo": materia.codigo}
        )
        await self.db.commit()
        await self.db.refresh(materia)
        return materia

    async def get_materia(self, id: uuid.UUID):
        materia = await self.materia_repo.get(id)
        if not materia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Materia not found")
        return materia

    async def list_materias(self, skip: int = 0, limit: int = 100):
        return await self.materia_repo.list(skip=skip, limit=limit)

    async def update_materia(self, request: Request, current_user: CurrentUser, id: uuid.UUID, schema: MateriaUpdate):
        materia = await self.get_materia(id)
        if schema.codigo and schema.codigo != materia.codigo:
            if await self.materia_repo.get_by_codigo(schema.codigo):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Materia code already exists")
                
        updated_materia = await self.materia_repo.update(materia.id, **schema.model_dump(exclude_unset=True))
        await log_audit_event(
            db=self.db, request=request, current_user=current_user,
            accion="MATERIA_MODIFICAR", detalle={"id": str(materia.id)}
        )
        await self.db.commit()
        await self.db.refresh(updated_materia)
        return updated_materia
