import pytest
import pytest_asyncio
import uuid
from sqlalchemy import insert, update, delete, select
from sqlalchemy.exc import IntegrityError, InternalError, ProgrammingError, DBAPIError
from httpx import AsyncClient
from app.main import app

from api.dependencies.auth import get_current_user, CurrentUser
from models.tenant import Tenant
from models.user import Usuario
from models.rbac import Permiso, Rol, RolPermiso, UsuarioRol
from models.audit import AuditLog
from core.security.password import get_password_hash

@pytest_asyncio.fixture
async def audit_test_data(db_session):
    tenant_id = uuid.uuid4()
    tenant = Tenant(id=tenant_id, nombre=f"Test Tenant Audit {tenant_id}")
    db_session.add(tenant)
    await db_session.flush()

    user_id = uuid.uuid4()
    user = Usuario(
        id=user_id,
        email=f"test_audit_{user_id}@example.com",
        password_hash=get_password_hash("password"),
        tenant_id=tenant_id
    )
    db_session.add(user)
    await db_session.flush()

    return {
        "tenant": tenant,
        "user": user
    }

@pytest.mark.asyncio
async def test_audit_log_append_only(audit_test_data, db_session):
    tenant = audit_test_data["tenant"]
    user = audit_test_data["user"]
    
    # Insert an audit log manually
    audit_id = uuid.uuid4()
    audit_entry = AuditLog(
        id=audit_id,
        actor_id=user.id,
        tenant_id=tenant.id,
        accion="TEST_ACTION",
        filas_afectadas=1
    )
    db_session.add(audit_entry)
    await db_session.commit()
    
    # Attempt to UPDATE the audit log
    update_stmt = update(AuditLog).where(AuditLog.id == audit_id).values(accion="UPDATED_ACTION")
    with pytest.raises((InternalError, ProgrammingError, DBAPIError)) as excinfo:
        await db_session.execute(update_stmt)
    assert "Updates and deletes are not allowed on the audit_log table" in str(excinfo.value)
    await db_session.rollback()
    
    # Attempt to DELETE the audit log
    delete_stmt = delete(AuditLog).where(AuditLog.id == audit_id)
    with pytest.raises((InternalError, ProgrammingError, DBAPIError)) as excinfo:
        await db_session.execute(delete_stmt)
    assert "Updates and deletes are not allowed on the audit_log table" in str(excinfo.value)
    await db_session.rollback()

@pytest.mark.asyncio
async def test_impersonation_token_generation(audit_test_data, client: AsyncClient, db_session):
    tenant = audit_test_data["tenant"]
    user = audit_test_data["user"]
    
    # Grant impersonation permission
    permiso = Permiso(nombre="impersonacion:usar")
    rol = Rol(nombre=f"ADMIN_{tenant.id}", tenant_id=tenant.id)
    db_session.add(permiso)
    db_session.add(rol)
    await db_session.flush()
    
    db_session.add(RolPermiso(rol_id=rol.id, permiso_id=permiso.id, tenant_id=tenant.id))
    db_session.add(UsuarioRol(usuario_id=user.id, rol_id=rol.id, tenant_id=tenant.id))
    
    # Create target user
    target_id = uuid.uuid4()
    target_user = Usuario(
        id=target_id,
        email=f"target_{target_id}@example.com",
        password_hash=get_password_hash("password"),
        tenant_id=tenant.id
    )
    db_session.add(target_user)
    await db_session.commit()
    
    # Mock authentication
    mock_user = CurrentUser(id=user.id, tenant_id=tenant.id, roles=[rol.nombre])
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    response = await client.post(
        "/api/auth/impersonate",
        json={"target_user_id": str(target_id)}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    # Verify JWT payload
    from core.security.jwt import decode_access_token
    payload = decode_access_token(data["access_token"])
    
    assert payload["sub"] == str(target_id)
    assert payload["impersonator_id"] == str(user.id)
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_audit_event_under_impersonation(audit_test_data, db_session):
    from core.audit import log_audit_event
    from fastapi import Request
    
    user = audit_test_data["user"]
    tenant = audit_test_data["tenant"]
    target_id = uuid.uuid4()
    target_user = Usuario(
        id=target_id,
        email=f"target_{target_id}@example.com",
        password_hash=get_password_hash("password"),
        tenant_id=tenant.id
    )
    db_session.add(target_user)
    await db_session.flush()
    
    # Mock request
    class MockClient:
        host = "192.168.1.1"
    class MockRequest:
        client = MockClient()
        headers = {"user-agent": "test-agent"}
        
        def __init__(self):
            self.headers = {"user-agent": "test-agent"}
            
    # CurrentUser with impersonator_id
    current_user_impersonated = CurrentUser(
        id=target_id,
        tenant_id=tenant.id,
        roles=["ALUMNO"],
        impersonator_id=user.id
    )
    
    await log_audit_event(
        db=db_session,
        request=MockRequest(),
        current_user=current_user_impersonated,
        accion="ACTION_WHILE_IMPERSONATED"
    )
    await db_session.commit()
    
    # Verify AuditLog
    stmt = select(AuditLog).where(AuditLog.accion == "ACTION_WHILE_IMPERSONATED")
    result = await db_session.execute(stmt)
    audit = result.scalars().first()
    
    assert audit is not None
    assert audit.actor_id == user.id # Actor is the impersonator
    assert audit.impersonado_id == target_id # Target is the impersonated
    assert audit.ip == "192.168.1.1"
