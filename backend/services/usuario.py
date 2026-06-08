import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from core.crypto import get_blind_index
from core.security.password import get_password_hash
from repositories.usuario import UsuarioRepository
from models.user import Usuario
from schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioPerfilUpdate
from models.audit import AuditLog
from fastapi import HTTPException

class UsuarioService:
    def __init__(self, db: AsyncSession, tenant_id: str):
        self.db = db
        self.tenant_id = uuid.UUID(tenant_id)
        self.usuario_repo = UsuarioRepository(db, self.tenant_id)

    async def get_usuario(self, usuario_id: uuid.UUID) -> Usuario | None:
        return await self.usuario_repo.get(usuario_id)

    async def get_usuarios(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        return await self.usuario_repo.list(skip=skip, limit=limit)

    async def create_usuario(self, data: UsuarioCreate) -> Usuario:
        # Validar unicidad de email_hash en el tenant
        existing = await self.usuario_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email ya registrado en este tenant")

        email_hash = get_blind_index(data.email)
        password_hash = get_password_hash(data.password)

        usuario = Usuario(
            tenant_id=self.tenant_id,
            email=data.email,
            email_hash=email_hash,
            password_hash=password_hash,
            nombre=data.nombre,
            apellido=data.apellido,
            dni=data.dni,
            cuil=data.cuil,
            cbu=data.cbu,
            alias_cbu=data.alias_cbu,
            legajo=data.legajo,
            activo=data.activo,
            totp_enabled=False
        )

        created = await self.usuario_repo.create(usuario)
        
        # Guardar auditoría (implícito o explícito dependiendo de cómo se haya implementado AuditLog)
        
        return created

    async def update_usuario(self, usuario_id: uuid.UUID, data: UsuarioUpdate) -> Usuario:
        usuario = await self.usuario_repo.get(usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        updated = await self.usuario_repo.update(usuario_id, update_data)
        return updated

    async def actualizar_perfil(self, usuario_id: uuid.UUID, data: UsuarioPerfilUpdate) -> Usuario:
        usuario = await self.usuario_repo.get(usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        # Aseguramos de no poder actualizar dni o cuil, pero Pydantic lo prohíbe ya.
        
        # Guardamos log de auditoría
        if update_data:
            log = AuditLog(
                tenant_id=self.tenant_id,
                usuario_id=usuario_id,
                accion="PERFIL_MODIFICADO",
                entidad="Usuario",
                entidad_id=usuario_id,
                detalles={"campos_modificados": list(update_data.keys())}
            )
            self.db.add(log)
            
        updated = await self.usuario_repo.update(usuario_id, update_data)
        return updated

    async def deactivate_usuario(self, usuario_id: uuid.UUID) -> Usuario:
        usuario = await self.usuario_repo.get(usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        updated = await self.usuario_repo.update(usuario_id, {"activo": False})
        return updated
