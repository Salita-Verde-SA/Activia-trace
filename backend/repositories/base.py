import uuid
from typing import Generic, TypeVar, Any, Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.base import Base
from models.mixins import utc_now

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Repositorio genérico que inyecta automáticamente el tenant_id 
    y respeta el soft delete transversal.
    """
    def __init__(self, model_class: type[ModelType], session: AsyncSession, tenant_id: uuid.UUID):
        self.model_class = model_class
        self.session = session
        self.tenant_id = tenant_id

    def _base_query(self):
        """
        Devuelve un objeto select() configurado para aislar el tenant 
        y ocultar los registros borrados.
        """
        # Asegura aislamiento row-level
        stmt = select(self.model_class).where(self.model_class.tenant_id == self.tenant_id)
        
        # Oculta registros soft-deleted
        if hasattr(self.model_class, 'deleted_at'):
            stmt = stmt.where(self.model_class.deleted_at.is_(None))
            
        return stmt

    async def get(self, id: Any) -> ModelType | None:
        stmt = self._base_query().where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        stmt = self._base_query().offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs) -> ModelType:
        # Se asegura de que el registro pertenezca al tenant del contexto
        kwargs['tenant_id'] = self.tenant_id
        db_obj = self.model_class(**kwargs)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, id: Any, **kwargs) -> ModelType | None:
        kwargs.pop("id", None)
        kwargs.pop("tenant_id", None)
        
        stmt = (
            update(self.model_class)
            .where(self.model_class.id == id)
            .where(self.model_class.tenant_id == self.tenant_id)
        )
        if hasattr(self.model_class, 'deleted_at'):
            stmt = stmt.where(self.model_class.deleted_at.is_(None))
            
        stmt = stmt.values(**kwargs).returning(self.model_class)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalars().first()

    async def delete(self, id: Any) -> bool:
        """
        Realiza un soft delete marcando deleted_at. Si el modelo no lo soporta, hace un borrado físico.
        """
        if hasattr(self.model_class, 'deleted_at'):
            stmt = (
                update(self.model_class)
                .where(self.model_class.id == id)
                .where(self.model_class.tenant_id == self.tenant_id)
                .where(self.model_class.deleted_at.is_(None))
                .values(deleted_at=utc_now())
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount > 0
        else:
            db_obj = await self.get(id)
            if db_obj:
                await self.session.delete(db_obj)
                await self.session.commit()
                return True
            return False
