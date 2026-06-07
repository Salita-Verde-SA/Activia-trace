import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.base import BaseRepository
from models.user import Usuario

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID | None = None):
        # We allow tenant_id to be None ONLY for cross-tenant operations like login
        # However, BaseRepository requires it, so we'll bypass it for login methods.
        self.session = session
        self.model_class = Usuario
        if tenant_id:
            super().__init__(Usuario, session, tenant_id)
            
    async def get_by_email_cross_tenant(self, email: str) -> Usuario | None:
        """Busca un usuario por email sin importar el tenant. Usado para login."""
        from core.crypto import get_blind_index
        email_hash = get_blind_index(email)
        stmt = select(Usuario).where(Usuario.email_hash == email_hash, Usuario.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        # Si la regla de negocio permitiera mismo email en distintos tenants,
        # esto tomaría el primero. Para simplificar, asumimos que email es único.
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Usuario | None:
        """Busca un usuario por email en el tenant actual."""
        from core.crypto import get_blind_index
        email_hash = get_blind_index(email)
        stmt = select(Usuario).where(Usuario.tenant_id == self.tenant_id, Usuario.email_hash == email_hash, Usuario.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalars().first()
