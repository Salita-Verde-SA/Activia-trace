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

    async def list_filtered(self, skip: int = 0, limit: int = 100, search: str | None = None, rol: str | None = None) -> list[Usuario]:
        stmt = self._base_query()
        
        if search:
            from sqlalchemy import or_
            stmt = stmt.where(or_(
                Usuario.nombre.ilike(f"%{search}%"),
                Usuario.apellido.ilike(f"%{search}%")
            ))
            
        if rol:
            from models.rbac import Rol, UsuarioRol
            stmt = stmt.join(UsuarioRol, Usuario.id == UsuarioRol.usuario_id)\
                       .join(Rol, Rol.id == UsuarioRol.rol_id)\
                       .where(Rol.nombre == rol)
                       
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        # Using unique() is important because of joins, though we don't eager load relationships here
        # Actually since roles_rel is selectin, it's a separate query, but joining might cause duplicates if not careful, though users have one rol here.
        return list(result.scalars().unique().all())

