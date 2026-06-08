import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import async_session_maker
from core.security.password import get_password_hash
from core.crypto import get_blind_index
from models.tenant import Tenant
from models.user import Usuario
from models.rbac import Rol, UsuarioRol

TEST_USERS = [
    {"email": "finanzas@activia.edu.ar", "rol": "FINANZAS", "nombre": "Fidel", "apellido": "Finanzas"},
    {"email": "coord@activia.edu.ar", "rol": "COORDINADOR", "nombre": "Cora", "apellido": "Coordinadora"},
    {"email": "profesor@activia.edu.ar", "rol": "PROFESOR", "nombre": "Pablo", "apellido": "Profesor"},
    {"email": "tutor@activia.edu.ar", "rol": "TUTOR", "nombre": "Tomas", "apellido": "Tutor"},
    {"email": "alumno@activia.edu.ar", "rol": "ALUMNO", "nombre": "Alan", "apellido": "Alumno"},
    {"email": "nexo@activia.edu.ar", "rol": "NEXO", "nombre": "Nora", "apellido": "Nexo"},
]

PASSWORD = "password123"

async def seed_test_users():
    async with async_session_maker() as session:
        result = await session.execute(select(Tenant).limit(1))
        tenant = result.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(nombre="Institución Demo")
            session.add(tenant)
            await session.flush()
        
        tenant_id = tenant.id

        for u in TEST_USERS:
            email_hash = get_blind_index(u["email"])
            
            # Check user
            result = await session.execute(
                select(Usuario).where(
                    Usuario.tenant_id == tenant_id,
                    Usuario.email_hash == email_hash,
                    Usuario.deleted_at.is_(None)
                )
            )
            user = result.scalar_one_or_none()
            
            if not user:
                user = Usuario(
                    tenant_id=tenant_id,
                    email=u["email"],
                    email_hash=email_hash,
                    password_hash=get_password_hash(PASSWORD),
                    nombre=u["nombre"],
                    apellido=u["apellido"],
                    activo=True,
                )
                session.add(user)
                await session.flush()
                print(f"User {u['email']} created.")

            # Assign Role
            result = await session.execute(
                select(Rol).where(Rol.tenant_id == tenant_id, Rol.nombre == u["rol"])
            )
            rol_db = result.scalar_one_or_none()
            
            if rol_db:
                # Check user-role
                res_ur = await session.execute(
                    select(UsuarioRol).where(
                        UsuarioRol.usuario_id == user.id,
                        UsuarioRol.rol_id == rol_db.id
                    )
                )
                if not res_ur.scalar_one_or_none():
                    session.add(UsuarioRol(
                        tenant_id=tenant_id,
                        usuario_id=user.id,
                        rol_id=rol_db.id,
                    ))
                    print(f"Role {u['rol']} assigned to {u['email']}.")
            else:
                print(f"WARN: Role {u['rol']} not found.")
        
        await session.commit()
        print("All test users seeded.")

if __name__ == "__main__":
    asyncio.run(seed_test_users())
