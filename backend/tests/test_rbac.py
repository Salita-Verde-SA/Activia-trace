import pytest
import pytest_asyncio
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient

from app.main import app
from api.dependencies.auth import require_permission, get_current_user, CurrentUser
from models.tenant import Tenant
from models.rbac import Permiso, Rol, RolPermiso

dummy_router = APIRouter()

@dummy_router.get("/api/test/protected/{action_id}")
async def protected_endpoint(action_id: str, user=Depends(get_current_user)):
    # To test the dependency dynamically, we use a manual invocation inside the endpoint or we just create multiple endpoints.
    # Actually, it's easier to just mock get_current_user and call the dependency directly or create a specific endpoint for the test action.
    pass

# We will just test the dependency directly in the tests instead of going through the router, or create a specific router for the test.
@dummy_router.get("/api/test/protected")
async def fixed_protected_endpoint(user=Depends(require_permission("test:action_fixed"))):
    return {"message": "success"}

app.include_router(dummy_router)

@pytest_asyncio.fixture
async def rbac_data(db_session: AsyncSession):
    tenant_id = uuid.uuid4()
    tenant = Tenant(id=tenant_id, nombre=f"Test Tenant RBAC {tenant_id}")
    db_session.add(tenant)
    await db_session.flush()

    # The permission "test:action_fixed" is needed by the fixed endpoint.
    # If it already exists, use it.
    result = await db_session.execute(select(Permiso).where(Permiso.nombre == "test:action_fixed"))
    permiso = result.scalar_one_or_none()
    if not permiso:
        permiso = Permiso(nombre="test:action_fixed")
        db_session.add(permiso)
        await db_session.flush()

    rol = Rol(nombre=f"TEST_ROLE_{tenant_id}", tenant_id=tenant_id)
    db_session.add(rol)
    await db_session.flush()

    rol_permiso = RolPermiso(rol_id=rol.id, permiso_id=permiso.id, tenant_id=tenant_id)
    db_session.add(rol_permiso)

    await db_session.commit()
    
    return {
        "tenant_id": tenant_id,
        "rol": rol,
        "permiso": permiso
    }

@pytest.mark.asyncio
async def test_require_permission_success(rbac_data, client: AsyncClient):
    user_id = uuid.uuid4()
    mock_user = CurrentUser(id=user_id, tenant_id=rbac_data["tenant_id"], roles=[rbac_data["rol"].nombre])
    
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    response = await client.get("/api/test/protected")
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_require_permission_forbidden(rbac_data, client: AsyncClient):
    user_id = uuid.uuid4()
    mock_user = CurrentUser(id=user_id, tenant_id=rbac_data["tenant_id"], roles=["OTHER_ROLE_THAT_DOES_NOT_EXIST"])
    
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    response = await client.get("/api/test/protected")
    assert response.status_code == 403
    assert "Missing required permission" in response.json()["detail"]
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_rbac_models_store_correctly(rbac_data, db_session: AsyncSession):
    query = select(Permiso).join(RolPermiso).join(Rol).where(
        Rol.nombre == rbac_data["rol"].nombre,
        Rol.tenant_id == rbac_data["tenant_id"]
    )
    result = await db_session.execute(query)
    permisos = result.scalars().all()
    assert len(permisos) == 1
    assert permisos[0].nombre == "test:action_fixed"
