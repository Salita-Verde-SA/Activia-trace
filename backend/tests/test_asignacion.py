import pytest
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import Usuario
from models.asignacion import Asignacion
from models.rbac import Rol, Permiso, RolPermiso
from models.tenant import Tenant
from core.crypto import get_blind_index
from core.security.password import get_password_hash

# Fixtures para setup de DB
@pytest.fixture
async def setup_test_data(db_session: AsyncSession):
    # Crear tenant
    tenant = Tenant(id=uuid.uuid4(), nombre="Tenant Test Asignacion")
    db_session.add(tenant)
    
    # Crear usuario
    usuario = Usuario(
        tenant_id=tenant.id,
        email="test_asig@example.com",
        email_hash=get_blind_index("test_asig@example.com"),
        password_hash=get_password_hash("12345678"),
        nombre="Test",
        apellido="Asig",
        activo=True
    )
    db_session.add(usuario)
    
    # Crear rol y permiso
    permiso = Permiso(nombre="test:permiso")
    db_session.add(permiso)
    await db_session.flush()
    
    rol = Rol(tenant_id=tenant.id, nombre="Rol Test Asig")
    db_session.add(rol)
    await db_session.flush()
    
    rol_permiso = RolPermiso(tenant_id=tenant.id, rol_id=rol.id, permiso_id=permiso.id)
    db_session.add(rol_permiso)
    
    await db_session.commit()
    
    return {
        "tenant": tenant,
        "usuario": usuario,
        "rol": rol,
        "permiso": permiso
    }

@pytest.mark.asyncio
async def test_asignacion_activa_permite_acceso(db_session: AsyncSession, setup_test_data):
    data = setup_test_data
    now = datetime.now(timezone.utc)
    
    # Crear asignacion activa
    asignacion = Asignacion(
        tenant_id=data["tenant"].id,
        usuario_id=data["usuario"].id,
        rol_id=data["rol"].id,
        desde=now - timedelta(days=1),
        hasta=now + timedelta(days=1)
    )
    db_session.add(asignacion)
    await db_session.commit()

    # Probar dependencias auth
    from api.dependencies.auth import CurrentUser
    from api.dependencies.auth import require_permission
    import fastapi
    
    checker = require_permission("test:permiso")
    
    current_user = CurrentUser(
        id=data["usuario"].id,
        tenant_id=data["tenant"].id,
        roles=[] # No importa
    )
    
    # Esto no debe fallar
    res = await checker(current_user=current_user, session=db_session)
    assert res == current_user

@pytest.mark.asyncio
async def test_asignacion_caducada_deniega_acceso(db_session: AsyncSession, setup_test_data):
    data = setup_test_data
    now = datetime.now(timezone.utc)
    
    # Crear asignacion caducada
    asignacion = Asignacion(
        tenant_id=data["tenant"].id,
        usuario_id=data["usuario"].id,
        rol_id=data["rol"].id,
        desde=now - timedelta(days=10),
        hasta=now - timedelta(days=1)
    )
    db_session.add(asignacion)
    await db_session.commit()

    from api.dependencies.auth import CurrentUser
    from api.dependencies.auth import require_permission
    from fastapi import HTTPException
    
    checker = require_permission("test:permiso")
    
    current_user = CurrentUser(
        id=data["usuario"].id,
        tenant_id=data["tenant"].id,
        roles=[]
    )
    
    with pytest.raises(HTTPException) as exc:
        await checker(current_user=current_user, session=db_session)
    
    assert exc.value.status_code == 403
    assert "Missing required permission" in exc.value.detail

@pytest.fixture
def asignacion_service(db_session: AsyncSession, setup_test_data):
    from services.asignacion import AsignacionService
    tenant = setup_test_data["tenant"]
    return AsignacionService(db_session, str(tenant.id))

@pytest.mark.asyncio
async def test_asignar_bloque_y_audit(db_session: AsyncSession, setup_test_data, asignacion_service):
    data = setup_test_data
    now = datetime.now(timezone.utc)
    from schemas.asignacion import AsignacionMasivaCreate, DocenteAsignacionInput
    from models.audit import AuditLog
    from sqlalchemy import select

    masiva_data = AsignacionMasivaCreate(
        docentes=[
            DocenteAsignacionInput(usuario_id=data["usuario"].id, rol_id=data["rol"].id)
        ],
        materia_id=uuid.uuid4(),
        carrera_id=uuid.uuid4(),
        cohorte_id=uuid.uuid4(),
        desde=now
    )

    actor_id = data["usuario"].id
    asignaciones = await asignacion_service.asignar_bloque(masiva_data, actor_id)

    assert len(asignaciones) == 1
    assert asignaciones[0].usuario_id == data["usuario"].id

    # Check audit log
    stmt = select(AuditLog).where(AuditLog.actor_id == actor_id, AuditLog.accion == 'ASIGNACION_MODIFICAR')
    result = await db_session.execute(stmt)
    logs = list(result.scalars().all())
    
    assert len(logs) == 1
    assert logs[0].detalle['tipo'] == 'masiva'
    assert logs[0].filas_afectadas == 1

@pytest.mark.asyncio
async def test_clonar_equipo(db_session: AsyncSession, setup_test_data, asignacion_service):
    data = setup_test_data
    now = datetime.now(timezone.utc)
    from schemas.asignacion import AsignacionMasivaCreate, DocenteAsignacionInput, ClonadoEquipoRequest
    from sqlalchemy import select
    from models.asignacion import Asignacion

    cohorte_origen = uuid.uuid4()
    cohorte_destino = uuid.uuid4()
    materia_id = uuid.uuid4()

    # Preparar origen
    masiva_data = AsignacionMasivaCreate(
        docentes=[
            DocenteAsignacionInput(usuario_id=data["usuario"].id, rol_id=data["rol"].id)
        ],
        materia_id=materia_id,
        cohorte_id=cohorte_origen,
        desde=now - timedelta(days=30),
        hasta=now
    )
    await asignacion_service.asignar_bloque(masiva_data, data["usuario"].id)

    # Clonar
    req = ClonadoEquipoRequest(
        materia_id=materia_id,
        cohorte_id_origen=cohorte_origen,
        cohorte_id_destino=cohorte_destino,
        nuevo_desde=now,
        nuevo_hasta=now + timedelta(days=60)
    )

    nuevas = await asignacion_service.clonar_equipo(req, data["usuario"].id)

    assert len(nuevas) == 1
    assert nuevas[0].cohorte_id == cohorte_destino
    assert nuevas[0].desde == req.nuevo_desde
    assert nuevas[0].hasta == req.nuevo_hasta

    # Verify origin is intact
    stmt = select(Asignacion).where(Asignacion.cohorte_id == cohorte_origen)
    res = await db_session.execute(stmt)
    viejas = list(res.scalars().all())
    assert len(viejas) == 1
    assert viejas[0].hasta == masiva_data.hasta

@pytest.mark.asyncio
async def test_mis_equipos_endpoint(client, db_session, setup_test_data):
    data = setup_test_data
    now = datetime.now(timezone.utc)
    from models.rbac import Permiso, RolPermiso
    
    permiso = Permiso(nombre="equipos:leer_propios")
    db_session.add(permiso)
    await db_session.flush()
    rp = RolPermiso(tenant_id=data["tenant"].id, rol_id=data["rol"].id, permiso_id=permiso.id)
    db_session.add(rp)
    
    asignacion = Asignacion(
        tenant_id=data["tenant"].id,
        usuario_id=data["usuario"].id,
        rol_id=data["rol"].id,
        desde=now - timedelta(days=1),
        hasta=now + timedelta(days=1)
    )
    db_session.add(asignacion)
    await db_session.commit()
    
    from app.main import app
    from api.dependencies.auth import get_current_user, CurrentUser
    
    def override_get_current_user():
        return CurrentUser(id=data["usuario"].id, tenant_id=data["tenant"].id)
        
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    response = await client.get("/api/equipos/mis-equipos")
    
    app.dependency_overrides.pop(get_current_user)
    
    assert response.status_code == 200
    res_data = response.json()
    assert len(res_data) == 1
    assert res_data[0]["usuario_id"] == str(data["usuario"].id)
