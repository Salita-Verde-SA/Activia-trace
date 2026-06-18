"""Avisos dirigidos a un alumno (alcance USUARIO).

- Validación de coherencia alcance↔destino en AvisoCreate (pydantic puro).
- Creación + lectura con DB real (sin mocks).
"""
import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from pydantic import ValidationError
from sqlalchemy import select

from models.tenant import Tenant
from models.user import Usuario
from models.avisos import Aviso, AlcanceAviso, SeveridadAviso
from schemas.aviso import AvisoCreate
from services.avisos import AvisoService


NOW = datetime(2026, 6, 17, tzinfo=timezone.utc)


def _base(**kw):
    data = dict(titulo="T", cuerpo="C", fecha_inicio=NOW)
    data.update(kw)
    return data


# ---------------------------------------------------------------------------
# 2. Validación de coherencia alcance ↔ destino
# ---------------------------------------------------------------------------

def test_usuario_sin_usuario_id_falla():
    with pytest.raises(ValidationError):
        AvisoCreate(**_base(alcance=AlcanceAviso.USUARIO))


def test_alcance_segmentado_con_usuario_id_falla():
    with pytest.raises(ValidationError):
        AvisoCreate(**_base(alcance=AlcanceAviso.MATERIA, materia_id=uuid4(), usuario_id=uuid4()))


def test_usuario_con_usuario_id_ok():
    a = AvisoCreate(**_base(alcance=AlcanceAviso.USUARIO, usuario_id=uuid4()))
    assert a.usuario_id is not None


def test_materia_con_materia_id_ok():
    a = AvisoCreate(**_base(alcance=AlcanceAviso.MATERIA, materia_id=uuid4()))
    assert a.usuario_id is None


# ---------------------------------------------------------------------------
# 3. Creación + lectura del aviso dirigido (DB real)
# ---------------------------------------------------------------------------

async def _seed_usuario(db, tenant_id, email=None):
    u = Usuario(
        tenant_id=tenant_id, email=email or f"u-{uuid4().hex[:8]}@test.com",
        email_hash=f"u-{uuid4().hex}", password_hash="x", nombre="Al", apellido="Umno",
    )
    db.add(u)
    await db.flush()
    return u.id


@pytest.mark.asyncio
async def test_aviso_usuario_solo_lo_ve_el_destinatario(db_session):
    tenant = Tenant(id=uuid4(), nombre="T")
    db_session.add(tenant)
    await db_session.flush()
    alumno_a = await _seed_usuario(db_session, tenant.id)
    alumno_b = await _seed_usuario(db_session, tenant.id)
    actor = await _seed_usuario(db_session, tenant.id)
    await db_session.commit()

    svc = AvisoService(db_session, tenant.id)
    aviso = await svc.crear_aviso(
        AvisoCreate(**_base(alcance=AlcanceAviso.USUARIO, usuario_id=alumno_a,
                            severidad=SeveridadAviso.WARNING, fecha_inicio=NOW - timedelta(days=1))),
        actor_id=actor,
    )

    vistos_a = await svc.listar_activos_para_usuario(alumno_a)
    vistos_b = await svc.listar_activos_para_usuario(alumno_b)

    assert any(v.aviso_id == aviso.id for v in vistos_a), "A debe ver su aviso dirigido"
    assert all(v.aviso_id != aviso.id for v in vistos_b), "B no debe ver el aviso de A"


@pytest.mark.asyncio
async def test_aviso_usuario_respeta_ack(db_session):
    from schemas.aviso import AvisoAcknowledgmentCreate
    tenant = Tenant(id=uuid4(), nombre="T")
    db_session.add(tenant)
    await db_session.flush()
    alumno = await _seed_usuario(db_session, tenant.id)
    actor = await _seed_usuario(db_session, tenant.id)
    await db_session.commit()

    svc = AvisoService(db_session, tenant.id)
    aviso = await svc.crear_aviso(
        AvisoCreate(**_base(alcance=AlcanceAviso.USUARIO, usuario_id=alumno, requiere_ack=True,
                            fecha_inicio=NOW - timedelta(days=1))),
        actor_id=actor,
    )

    antes = await svc.listar_activos_para_usuario(alumno)
    visto = next(v for v in antes if v.aviso_id == aviso.id)
    assert visto.ack_at is None

    await svc.registrar_acuse_recibo(alumno, AvisoAcknowledgmentCreate(aviso_id=aviso.id))

    despues = await svc.listar_activos_para_usuario(alumno)
    visto2 = next((v for v in despues if v.aviso_id == aviso.id), None)
    assert visto2 is not None, "tras ack el aviso debe seguir visible"
    assert visto2.ack_at is not None, "tras ack debe quedar marcado como leído"


@pytest.mark.asyncio
async def test_aviso_usuario_aislado_por_tenant(db_session):
    t1 = Tenant(id=uuid4(), nombre="T1")
    t2 = Tenant(id=uuid4(), nombre="T2")
    db_session.add_all([t1, t2])
    await db_session.flush()
    alumno = await _seed_usuario(db_session, t1.id)
    actor = await _seed_usuario(db_session, t1.id)
    await db_session.commit()

    svc1 = AvisoService(db_session, t1.id)
    aviso = await svc1.crear_aviso(
        AvisoCreate(**_base(alcance=AlcanceAviso.USUARIO, usuario_id=alumno,
                            fecha_inicio=NOW - timedelta(days=1))),
        actor_id=actor,
    )

    # Mismo usuario_id consultado bajo otro tenant → no aparece.
    svc2 = AvisoService(db_session, t2.id)
    vistos = await svc2.listar_activos_para_usuario(alumno)
    assert all(v.aviso_id != aviso.id for v in vistos)


# ---------------------------------------------------------------------------
# 5. Endpoint contactar-alumno (arma aviso dirigido)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_contactar_alumno_crea_aviso_usuario_warning(mocker):
    from api.endpoints.avisos import contactar_alumno
    from schemas.aviso import ContactarAlumnoRequest

    mock_crear = mocker.patch(
        "api.endpoints.avisos.AvisoService.crear_aviso", new_callable=mocker.AsyncMock)
    actor = Usuario(id=uuid4(), tenant_id=uuid4())
    uid = uuid4()
    req = ContactarAlumnoRequest(usuario_id=uid, titulo="Ojo", cuerpo="ponete las pilas")

    await contactar_alumno(req, db=mocker.AsyncMock(), current_user=actor)

    mock_crear.assert_called_once()
    aviso_arg = mock_crear.call_args.args[0]
    assert aviso_arg.alcance == AlcanceAviso.USUARIO
    assert aviso_arg.severidad == SeveridadAviso.WARNING
    assert aviso_arg.usuario_id == uid
    assert aviso_arg.requiere_ack is True
