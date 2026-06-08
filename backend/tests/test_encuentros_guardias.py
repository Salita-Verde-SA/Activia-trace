import pytest
from uuid import uuid4
from datetime import date, time, timedelta, datetime, timezone
from models.encuentros import SlotEncuentro, InstanciaEncuentro, Guardia, DiaSemana, EstadoInstancia, EstadoGuardia
from schemas.encuentro import SlotEncuentroCreate, InstanciaEncuentroUpdate
from schemas.guardia import GuardiaCreate
from services.encuentros import EncuentroService, GuardiaService

@pytest.mark.asyncio
async def test_crear_encuentro_recurrente(db_session, tenant_id):
    asignacion_id = uuid4()
    materia_id = uuid4()
    # Assuming today is Monday 2026-06-08 (just an example), let's use a fixed date: 2026-06-08 is a Monday
    start_date = date(2026, 6, 8) 
    
    data = SlotEncuentroCreate(
        materia_id=materia_id,
        titulo="Clase de Consulta",
        hora=time(14, 0),
        dia_semana=DiaSemana.MIERCOLES,
        fecha_inicio=start_date,
        cant_semanas=3
    )

    service = EncuentroService(db_session, tenant_id)
    result = await service.crear_encuentro(asignacion_id, data)

    slot = result["slot"]
    instancias = result["instancias"]

    assert slot.titulo == "Clase de Consulta"
    assert len(instancias) == 3
    # The first Wednesday after 2026-06-08 (Monday) is 2026-06-10
    assert instancias[0].fecha == date(2026, 6, 10)
    assert instancias[1].fecha == date(2026, 6, 17)
    assert instancias[2].fecha == date(2026, 6, 24)

@pytest.mark.asyncio
async def test_editar_instancia(db_session, tenant_id):
    # Setup
    slot_id = uuid4()
    instancia = InstanciaEncuentro(
        id=uuid4(),
        tenant_id=tenant_id,
        slot_id=slot_id,
        materia_id=uuid4(),
        fecha=date(2026, 6, 10),
        hora=time(14, 0),
        titulo="Clase de Consulta",
        estado=EstadoInstancia.PROGRAMADO
    )
    db_session.add(instancia)
    await db_session.commit()

    service = EncuentroService(db_session, tenant_id)
    update_data = InstanciaEncuentroUpdate(
        estado=EstadoInstancia.CANCELADO,
        meet_url="http://meet.google.com/abc-defg-hij"
    )
    updated = await service.editar_instancia(instancia.id, update_data)
    
    assert updated.estado == EstadoInstancia.CANCELADO
    assert updated.meet_url == "http://meet.google.com/abc-defg-hij"

@pytest.mark.asyncio
async def test_generar_html_moodle(db_session, tenant_id):
    materia_id = uuid4()
    instancia = InstanciaEncuentro(
        id=uuid4(),
        tenant_id=tenant_id,
        slot_id=uuid4(),
        materia_id=materia_id,
        fecha=date(2026, 6, 10),
        hora=time(14, 0),
        titulo="Clase 1",
        estado=EstadoInstancia.PROGRAMADO,
        meet_url="http://meet.google.com/test"
    )
    db_session.add(instancia)
    await db_session.commit()

    service = EncuentroService(db_session, tenant_id)
    html = await service.generar_html_moodle(materia_id)
    
    assert "<table" in html
    assert "Clase 1" in html
    assert "http://meet.google.com/test" in html
    assert "10/06/2026" in html
    assert "14:00" in html

@pytest.mark.asyncio
async def test_registrar_y_exportar_guardia(db_session, tenant_id):
    asignacion_id = uuid4()
    materia_id = uuid4()
    
    data = GuardiaCreate(
        materia_id=materia_id,
        dia=DiaSemana.LUNES,
        horario="14:00-16:00",
        comentarios="Atención normal"
    )

    service = GuardiaService(db_session, tenant_id)
    guardia = await service.registrar_guardia(asignacion_id, data)

    assert guardia.id is not None
    assert guardia.tenant_id == tenant_id
    assert guardia.asignacion_id == asignacion_id
    assert guardia.estado == EstadoGuardia.REALIZADA

    # Export
    today = date.today()
    guardias = await service.exportar_guardias(today - timedelta(days=1), today + timedelta(days=1))
    assert len(guardias) == 1
    assert guardias[0].id == guardia.id
