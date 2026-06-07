import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.main import app

from api.dependencies.auth import get_current_user, CurrentUser
from models.tenant import Tenant
from models.user import Usuario
from models.estructura import EstadoEstructura
from core.security.password import get_password_hash

@pytest_asyncio.fixture
async def estructura_test_data(db_session):
    tenant_id = uuid.uuid4()
    tenant = Tenant(id=tenant_id, nombre=f"Test Tenant {tenant_id}")
    db_session.add(tenant)
    await db_session.flush()

    user_id = uuid.uuid4()
    user = Usuario(
        id=user_id,
        email=f"test_estructura_{user_id}@example.com",
        password_hash=get_password_hash("password"),
        tenant_id=tenant_id
    )
    db_session.add(user)
    await db_session.flush()

    from models.rbac import Rol, Permiso, RolPermiso, UsuarioRol
    from sqlalchemy import select
    from sqlalchemy.dialects.postgresql import insert
    
    rol = Rol(nombre="ADMIN", tenant_id=tenant_id)
    db_session.add(rol)
    await db_session.flush()
    
    stmt_permiso = insert(Permiso).values(
        nombre="estructura:gestionar"
    ).on_conflict_do_nothing()
    await db_session.execute(stmt_permiso)
    await db_session.flush()
    
    stmt_sel = select(Permiso).where(Permiso.nombre == "estructura:gestionar")
    permiso = (await db_session.execute(stmt_sel)).scalars().first()
    
    db_session.add(RolPermiso(rol_id=rol.id, permiso_id=permiso.id, tenant_id=tenant_id))
    db_session.add(UsuarioRol(usuario_id=user.id, rol_id=rol.id, tenant_id=tenant_id))
    await db_session.commit()

    return {
        "tenant": tenant,
        "user": user
    }

@pytest_asyncio.fixture
def auth_client(estructura_test_data, client):
    user = estructura_test_data["user"]
    tenant = estructura_test_data["tenant"]
    
    mock_user = CurrentUser(id=user.id, tenant_id=tenant.id, roles=["ADMIN"])
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    yield client
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_carrera_lifecycle(auth_client, db_session):
    # Create Carrera
    response = await auth_client.post(
        "/api/admin/carreras",
        json={"codigo": "INF-01", "nombre": "Ingenieria Informatica"}
    )
    assert response.status_code == 201
    carrera = response.json()
    assert carrera["codigo"] == "INF-01"
    assert carrera["estado"] == EstadoEstructura.ACTIVA.value
    
    carrera_id = carrera["id"]

    # Duplicate code
    response = await auth_client.post(
        "/api/admin/carreras",
        json={"codigo": "INF-01", "nombre": "Otra"}
    )
    assert response.status_code == 409

    # List Carreras
    response = await auth_client.get("/api/admin/carreras")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Deactivate Carrera
    response = await auth_client.patch(
        f"/api/admin/carreras/{carrera_id}",
        json={"estado": EstadoEstructura.INACTIVA.value}
    )
    assert response.status_code == 200
    assert response.json()["estado"] == EstadoEstructura.INACTIVA.value

@pytest.mark.asyncio
async def test_cohorte_lifecycle(auth_client, db_session):
    # Create Carrera
    response = await auth_client.post(
        "/api/admin/carreras",
        json={"codigo": "SIS-01", "nombre": "Sistemas"}
    )
    carrera_id = response.json()["id"]

    # Create Cohorte
    response = await auth_client.post(
        "/api/admin/cohortes",
        json={
            "carrera_id": carrera_id,
            "nombre": "Cohorte 2024",
            "anio": 2024,
            "vig_desde": "2024-01-01"
        }
    )
    assert response.status_code == 201
    cohorte = response.json()
    assert cohorte["nombre"] == "Cohorte 2024"
    
    # Duplicate name in same carrera
    response = await auth_client.post(
        "/api/admin/cohortes",
        json={
            "carrera_id": carrera_id,
            "nombre": "Cohorte 2024",
            "anio": 2025,
            "vig_desde": "2025-01-01"
        }
    )
    assert response.status_code == 409

    # Deactivate Carrera
    await auth_client.patch(f"/api/admin/carreras/{carrera_id}", json={"estado": EstadoEstructura.INACTIVA.value})

    # Try creating Cohorte in Inactive Carrera
    response = await auth_client.post(
        "/api/admin/cohortes",
        json={
            "carrera_id": carrera_id,
            "nombre": "Cohorte 2025",
            "anio": 2025,
            "vig_desde": "2025-01-01"
        }
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_materia_lifecycle(auth_client, db_session):
    # Create Materia
    response = await auth_client.post(
        "/api/admin/materias",
        json={"codigo": "MAT-01", "nombre": "Matematica"}
    )
    assert response.status_code == 201
    materia = response.json()
    assert materia["codigo"] == "MAT-01"

    # Duplicate code
    response = await auth_client.post(
        "/api/admin/materias",
        json={"codigo": "MAT-01", "nombre": "Otra"}
    )
    assert response.status_code == 409
