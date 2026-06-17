"""Tests con DB real (sin mocks) para:
- idempotencia de la importación de calificaciones (no duplica al re-importar)
- unicidad a nivel de base (índice parcial)
- Mi Estado del alumno: solo versión activa + aprobado derivado del umbral vigente

Cada test siembra su propio grafo de FKs (tenant → carrera → cohorte → materia →
usuario → version_padron → entrada_padron) y se aísla por tenant_id único.
"""
import pytest
from uuid import uuid4
from datetime import date

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from models.tenant import Tenant
from models.estructura import Carrera, Cohorte, Materia
from models.user import Usuario
from models.padron import VersionPadron, EntradaPadron
from models.calificacion import Calificacion, UmbralMateria
from schemas.calificacion import ImportConfirmRequest, ColumnMap
from services.calificacion import CalificacionService


class Base:
    """Contenedor simple de ids sembrados."""
    def __init__(self, **kw):
        self.__dict__.update(kw)


async def _seed_base(db):
    tenant = Tenant(id=uuid4(), nombre="Tenant Test")
    db.add(tenant)
    await db.flush()
    carrera = Carrera(tenant_id=tenant.id, codigo=f"C{uuid4().hex[:6]}", nombre="Ingeniería")
    db.add(carrera)
    await db.flush()
    cohorte = Cohorte(
        tenant_id=tenant.id, carrera_id=carrera.id, nombre="2026",
        anio=2026, vig_desde=date(2026, 1, 1),
    )
    materia = Materia(tenant_id=tenant.id, codigo=f"M{uuid4().hex[:6]}", nombre="Matemática 1")
    loader = Usuario(
        tenant_id=tenant.id, email=f"prof-{uuid4().hex[:8]}@test.com",
        email_hash=f"prof-{uuid4().hex}", password_hash="x", nombre="Prof", apellido="Loader",
    )
    db.add_all([cohorte, materia, loader])
    await db.flush()
    return Base(
        tenant_id=tenant.id, carrera_id=carrera.id, cohorte_id=cohorte.id,
        materia_id=materia.id, loader_id=loader.id,
    )


async def _seed_alumno(db, base, email=None):
    u = Usuario(
        tenant_id=base.tenant_id, email=email or f"al-{uuid4().hex[:8]}@test.com",
        email_hash=f"al-{uuid4().hex}", password_hash="x", nombre="Al", apellido="Umno",
    )
    db.add(u)
    await db.flush()
    return u.id


async def _seed_version(db, base, *, activa=True, alumno_email="alumno@test.com",
                        alumno_usuario_id=None):
    version = VersionPadron(
        tenant_id=base.tenant_id, materia_id=base.materia_id, cohorte_id=base.cohorte_id,
        cargado_por=base.loader_id, activa=activa,
    )
    db.add(version)
    await db.flush()
    entrada = EntradaPadron(
        tenant_id=base.tenant_id, version_id=version.id, usuario_id=alumno_usuario_id,
        nombre="Juan", apellidos="Pérez", email=alumno_email,
    )
    db.add(entrada)
    await db.flush()
    return version, entrada


def _import_request(base, version_id, columnas, es_reporte_finalizacion=False):
    return ImportConfirmRequest(
        materia_id=base.materia_id,
        cohorte_id=base.cohorte_id,
        version_padron_id=version_id,
        columnas=columnas,
        es_reporte_finalizacion=es_reporte_finalizacion,
    )


async def _live_califs(db, entrada_id, actividad=None):
    stmt = select(Calificacion).where(
        Calificacion.entrada_padron_id == entrada_id,
        Calificacion.deleted_at.is_(None),
    )
    if actividad:
        stmt = stmt.where(Calificacion.actividad_nombre == actividad)
    res = await db.execute(stmt)
    return res.scalars().all()


# ---------------------------------------------------------------------------
# 2. Importación idempotente
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_reimportar_no_duplica_calificaciones(db_session):
    base = await _seed_base(db_session)
    version, entrada = await _seed_version(db_session, base, alumno_email="a@test.com")
    await db_session.commit()

    cols = [ColumnMap(nombre_columna="Parcial 1", es_numerica=True),
            ColumnMap(nombre_columna="TP1", es_numerica=True)]
    csv = "email,Parcial 1,TP1\na@test.com,7,8\n".encode()
    req = _import_request(base, version.id, cols)

    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id, req, csv)
    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id, req, csv)

    live = await _live_califs(db_session, entrada.id)
    nombres = sorted(c.actividad_nombre for c in live)
    assert nombres == ["Parcial 1", "TP1"], f"esperaba 1 viva por actividad, hubo {nombres}"


@pytest.mark.asyncio
async def test_reimportar_soft_deletea_previa_y_actualiza_valor(db_session):
    base = await _seed_base(db_session)
    version, entrada = await _seed_version(db_session, base, alumno_email="b@test.com")
    await db_session.commit()

    cols = [ColumnMap(nombre_columna="TP1", es_numerica=True)]
    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id,
        _import_request(base, version.id, cols), b"email,TP1\nb@test.com,7\n")
    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id,
        _import_request(base, version.id, cols), b"email,TP1\nb@test.com,9\n")

    live = await _live_califs(db_session, entrada.id, "TP1")
    assert len(live) == 1
    assert live[0].nota_numerica == 9.0

    todas = await db_session.execute(
        select(Calificacion).where(Calificacion.entrada_padron_id == entrada.id))
    todas = todas.scalars().all()
    soft_deleted = [c for c in todas if c.deleted_at is not None]
    assert len(soft_deleted) == 1
    assert soft_deleted[0].nota_numerica == 7.0


@pytest.mark.asyncio
async def test_csv_reemplaza_reporte_finalizacion_misma_actividad(db_session):
    """TRIANGULATE: import numérico reemplaza una actividad que vino como finalización."""
    base = await _seed_base(db_session)
    version, entrada = await _seed_version(db_session, base, alumno_email="c@test.com")
    await db_session.commit()

    cols = [ColumnMap(nombre_columna="Coloquio", es_numerica=True)]
    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id,
        _import_request(base, version.id, cols, es_reporte_finalizacion=True),
        b"email,Coloquio\nc@test.com,x\n")
    await CalificacionService.confirmar_importacion(
        db_session, base.tenant_id, base.loader_id,
        _import_request(base, version.id, cols),
        b"email,Coloquio\nc@test.com,8\n")

    live = await _live_califs(db_session, entrada.id, "Coloquio")
    assert len(live) == 1
    assert live[0].nota_numerica == 8.0
    assert live[0].origen == "IMPORTADO_CSV"


@pytest.mark.asyncio
async def test_unicidad_db_rechaza_segunda_viva(db_session):
    base = await _seed_base(db_session)
    version, entrada = await _seed_version(db_session, base, alumno_email="d@test.com")
    await db_session.commit()

    db_session.add(Calificacion(
        tenant_id=base.tenant_id, entrada_padron_id=entrada.id,
        actividad_nombre="TP1", nota_numerica=5.0, aprobado=False, origen="IMPORTADO_CSV"))
    await db_session.commit()

    db_session.add(Calificacion(
        tenant_id=base.tenant_id, entrada_padron_id=entrada.id,
        actividad_nombre="TP1", nota_numerica=6.0, aprobado=False, origen="IMPORTADO_CSV"))
    with pytest.raises(IntegrityError):
        await db_session.flush()


# ---------------------------------------------------------------------------
# 3. Mi Estado: versión activa + aprobado derivado
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_mi_estado_solo_version_activa(db_session):
    base = await _seed_base(db_session)
    alumno_id = await _seed_alumno(db_session, base)
    # versión vieja (inactiva) con TP1, y versión activa con TP1
    _, ent_old = await _seed_version(db_session, base, activa=False,
                                     alumno_email="e@test.com", alumno_usuario_id=alumno_id)
    _, ent_new = await _seed_version(db_session, base, activa=True,
                                     alumno_email="e@test.com", alumno_usuario_id=alumno_id)
    for ent in (ent_old, ent_new):
        db_session.add(Calificacion(
            tenant_id=base.tenant_id, entrada_padron_id=ent.id,
            actividad_nombre="TP1", nota_numerica=8.0, aprobado=True, origen="IMPORTADO_CSV"))
    await db_session.commit()

    estados = await CalificacionService.obtener_estado_alumno(
        db_session, base.tenant_id, alumno_id)

    assert len(estados) == 1
    califs = estados[0].calificaciones
    assert len(califs) == 1, f"esperaba 1 fila (solo versión activa), hubo {len(califs)}"


@pytest.mark.asyncio
async def test_mi_estado_aprobado_derivado_del_umbral(db_session):
    base = await _seed_base(db_session)
    alumno_id = await _seed_alumno(db_session, base)
    _, entrada = await _seed_version(db_session, base, activa=True,
                                    alumno_email="f@test.com", alumno_usuario_id=alumno_id)
    # nota 7.0 con flag almacenado aprobado=True (como import a 60%)
    db_session.add(Calificacion(
        tenant_id=base.tenant_id, entrada_padron_id=entrada.id,
        actividad_nombre="TP1", nota_numerica=7.0, aprobado=True, origen="IMPORTADO_CSV"))
    # umbral ahora 80 → 70 < 80 reprueba
    db_session.add(UmbralMateria(
        tenant_id=base.tenant_id, materia_id=base.materia_id, umbral_pct=80.0, valores_aprobatorios=[]))
    await db_session.commit()

    estados = await CalificacionService.obtener_estado_alumno(
        db_session, base.tenant_id, alumno_id)

    assert len(estados) == 1
    materia = estados[0]
    assert materia.calificaciones[0].aprobado is False, "debe recalcular contra umbral vigente (80)"
    assert materia.estado == "en_riesgo"
