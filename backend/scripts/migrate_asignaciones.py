import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import async_session_maker
from models.rbac import UsuarioRol
from models.asignacion import Asignacion

async def migrate_usuario_rol_to_asignacion():
    async with async_session_maker() as session:
        result = await session.execute(select(UsuarioRol))
        user_roles = result.scalars().all()
        
        count = 0
        for ur in user_roles:
            # Check if an assignment already exists for this user and role
            existing = await session.execute(
                select(Asignacion).where(
                    Asignacion.usuario_id == ur.usuario_id,
                    Asignacion.rol_id == ur.rol_id
                )
            )
            if not existing.scalar_one_or_none():
                asignacion = Asignacion(
                    tenant_id=ur.tenant_id,
                    usuario_id=ur.usuario_id,
                    rol_id=ur.rol_id,
                    desde=datetime.now(timezone.utc) - timedelta(days=365*10),
                    hasta=None
                )
                session.add(asignacion)
                count += 1
                
        await session.commit()
        print(f"Migrated {count} UsuarioRol records to Asignacion")

if __name__ == "__main__":
    asyncio.run(migrate_usuario_rol_to_asignacion())
