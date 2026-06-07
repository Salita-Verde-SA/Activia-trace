import pytest
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from models.tenant import Tenant
from services.usuario import UsuarioService
from services.asignacion import AsignacionService
from schemas.usuario import UsuarioCreate
from schemas.asignacion import AsignacionCreate
from core.crypto import get_blind_index

@pytest.fixture
async def setup_tenant(db_session: AsyncSession):
    tenant = Tenant(id=uuid.uuid4(), nombre="Tenant Services")
    db_session.add(tenant)
    await db_session.commit()
    return tenant

@pytest.mark.asyncio
async def test_usuario_service(db_session: AsyncSession, setup_tenant):
    tenant = setup_tenant
    service = UsuarioService(db_session, str(tenant.id))
    
    data = UsuarioCreate(
        tenant_id=str(tenant.id),
        email="user_svc@test.com",
        password="password123",
        nombre="Name",
        apellido="Sur"
    )
    
    # Create
    user = await service.create_usuario(data)
    assert user.id is not None
    assert user.nombre == "Name"
    assert user.email_hash == get_blind_index("user_svc@test.com")
    
    # Get
    user_get = await service.get_usuario(user.id)
    assert user_get is not None
    assert user_get.email_hash == user.email_hash

@pytest.mark.asyncio
async def test_asignacion_service(db_session: AsyncSession, setup_tenant):
    tenant = setup_tenant
    
    # Need to create user and rol to assign
    from models.user import Usuario
    from models.rbac import Rol
    from core.security.password import get_password_hash
    
    user = Usuario(
        tenant_id=tenant.id,
        email="user_asig_svc@test.com",
        email_hash=get_blind_index("user_asig_svc@test.com"),
        password_hash=get_password_hash("pw"),
        nombre="Test",
        apellido="Asig",
        activo=True
    )
    db_session.add(user)
    
    rol = Rol(tenant_id=tenant.id, nombre="Rol Asig Svc")
    db_session.add(rol)
    await db_session.commit()
    
    # Test service
    service = AsignacionService(db_session, str(tenant.id))
    now = datetime.now(timezone.utc)
    
    data = AsignacionCreate(
        tenant_id=str(tenant.id),
        usuario_id=user.id,
        rol_id=rol.id,
        desde=now
    )
    
    asignacion = await service.create_asignacion(data)
    assert asignacion.id is not None
    assert asignacion.usuario_id == user.id
    
    list_asig = await service.get_asignaciones_by_usuario(user.id)
    assert len(list_asig) == 1
    assert list_asig[0].id == asignacion.id
