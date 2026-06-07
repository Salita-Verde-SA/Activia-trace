import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import async_session_maker
from models.tenant import Tenant
from models.rbac import Permiso, Rol, RolPermiso

ROLES = ["ALUMNO", "TUTOR", "PROFESOR", "COORDINADOR", "NEXO", "ADMIN", "FINANZAS"]

PERMISOS = [
    "academico:estado_propio",
    "evaluacion:reservar",
    "avisos:confirmar",
    "calificaciones:importar",
    "atrasados:ver",
    "entregas:detectar",
    "comunicacion:enviar",
    "comunicacion:aprobar",
    "encuentros:gestionar",
    "guardias:registrar",
    "tareas:gestionar",
    "avisos:publicar",
    "equipos:gestionar",
    "estructura:gestionar",
    "usuarios:gestionar",
    "auditoria:ver",
    "finanzas:grilla",
    "finanzas:liquidar",
    "finanzas:facturar",
    "tenant:configurar"
]

ROLES_PERMISOS = {
    "ALUMNO": ["academico:estado_propio", "evaluacion:reservar", "avisos:confirmar"],
    "TUTOR": ["avisos:confirmar", "atrasados:ver", "entregas:detectar", "encuentros:gestionar", "guardias:registrar"],
    "PROFESOR": [
        "avisos:confirmar", "calificaciones:importar", "atrasados:ver", "entregas:detectar",
        "comunicacion:enviar", "encuentros:gestionar", "guardias:registrar", "tareas:gestionar"
    ],
    "COORDINADOR": [
        "avisos:confirmar", "calificaciones:importar", "atrasados:ver", "entregas:detectar",
        "comunicacion:enviar", "comunicacion:aprobar", "encuentros:gestionar", "guardias:registrar",
        "tareas:gestionar", "avisos:publicar", "equipos:gestionar", "auditoria:ver"
    ],
    "NEXO": [],
    "ADMIN": [
        "avisos:confirmar", "calificaciones:importar", "atrasados:ver", "entregas:detectar",
        "comunicacion:enviar", "comunicacion:aprobar", "encuentros:gestionar", "guardias:registrar",
        "tareas:gestionar", "avisos:publicar", "equipos:gestionar", "estructura:gestionar",
        "usuarios:gestionar", "auditoria:ver", "tenant:configurar"
    ],
    "FINANZAS": [
        "avisos:confirmar", "auditoria:ver", "finanzas:grilla", "finanzas:liquidar", "finanzas:facturar"
    ]
}

async def seed_rbac():
    async with async_session_maker() as session:
        for p_nombre in PERMISOS:
            result = await session.execute(select(Permiso).where(Permiso.nombre == p_nombre))
            if not result.scalar_one_or_none():
                session.add(Permiso(nombre=p_nombre))
        
        await session.commit()
        
        result = await session.execute(select(Permiso))
        permisos_db = {p.nombre: p for p in result.scalars().all()}
        
        result = await session.execute(select(Tenant))
        tenants = result.scalars().all()
        
        for tenant in tenants:
            for rol_nombre in ROLES:
                result = await session.execute(
                    select(Rol).where(Rol.tenant_id == tenant.id, Rol.nombre == rol_nombre)
                )
                rol = result.scalar_one_or_none()
                if not rol:
                    rol = Rol(nombre=rol_nombre, tenant_id=tenant.id)
                    session.add(rol)
                    await session.flush()
                
                for p_nombre in ROLES_PERMISOS.get(rol_nombre, []):
                    permiso = permisos_db[p_nombre]
                    result = await session.execute(
                        select(RolPermiso).where(
                            RolPermiso.rol_id == rol.id,
                            RolPermiso.permiso_id == permiso.id,
                            RolPermiso.tenant_id == tenant.id
                        )
                    )
                    if not result.scalar_one_or_none():
                        session.add(RolPermiso(
                            rol_id=rol.id, 
                            permiso_id=permiso.id,
                            tenant_id=tenant.id
                        ))
        
        await session.commit()
        print("RBAC Seed completado.")

if __name__ == "__main__":
    asyncio.run(seed_rbac())
