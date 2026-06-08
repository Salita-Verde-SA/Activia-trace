"""
Seed script para crear un usuario ADMIN de desarrollo.
Uso: docker-compose exec api python -m scripts.seed_admin
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import async_session_maker
from core.security.password import get_password_hash
from core.crypto import get_blind_index
from models.tenant import Tenant
from models.user import Usuario
from models.rbac import Rol, UsuarioRol


ADMIN_EMAIL = "admin@activia.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NOMBRE = "Admin"
ADMIN_APELLIDO = "Dev"


async def seed_admin():
    async with async_session_maker() as session:
        # 1. Obtener el primer tenant
        result = await session.execute(select(Tenant).limit(1))
        tenant = result.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(nombre="Institución Demo")
            session.add(tenant)
            await session.flush()
            print(f"Tenant creado: {tenant.id} ({tenant.nombre})")

        tenant_id = tenant.id
        email_hash = get_blind_index(ADMIN_EMAIL)

        # 2. Verificar si ya existe
        result = await session.execute(
            select(Usuario).where(
                Usuario.tenant_id == tenant_id,
                Usuario.email_hash == email_hash,
                Usuario.deleted_at.is_(None),
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            print(f"El usuario {ADMIN_EMAIL} ya existe (id={existing.id}). Nada que hacer.")
            return

        # 3. Crear usuario
        user = Usuario(
            tenant_id=tenant_id,
            email=ADMIN_EMAIL,
            email_hash=email_hash,
            password_hash=get_password_hash(ADMIN_PASSWORD),
            nombre=ADMIN_NOMBRE,
            apellido=ADMIN_APELLIDO,
            activo=True,
        )
        session.add(user)
        await session.flush()

        # 4. Asignar rol ADMIN
        result = await session.execute(
            select(Rol).where(Rol.tenant_id == tenant_id, Rol.nombre == "ADMIN")
        )
        rol_admin = result.scalar_one_or_none()
        if rol_admin:
            session.add(UsuarioRol(
                tenant_id=tenant_id,
                usuario_id=user.id,
                rol_id=rol_admin.id,
            ))
            print(f"Rol ADMIN asignado.")
        else:
            print("WARN: Rol ADMIN no encontrado. Ejecutá seed_rbac primero.")

        await session.commit()
        print(f"Usuario admin creado:")
        print(f"  Email:    {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  ID:       {user.id}")
        print(f"  Tenant:   {tenant_id}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
