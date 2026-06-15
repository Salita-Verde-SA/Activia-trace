import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from models.coloquios import ConvocatoriaColoquio, TurnoColoquio, CandidatoColoquio, EstadoConvocatoria
from models.user import Usuario
from schemas.coloquio import ConvocatoriaColoquioCreate, TurnoColoquioCreate
from services.coloquios import ColoquioService
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_crear_convocatoria(db_session, tenant_id):
    service = ColoquioService(db_session, tenant_id)
    materia_id = uuid4()
    
    # Datos para crear
    fecha_inicio = datetime.now(timezone.utc) + timedelta(days=1)
    fecha_fin = fecha_inicio + timedelta(hours=2)
    
    data = ConvocatoriaColoquioCreate(
        materia_id=materia_id,
        nombre="Coloquio Final Diciembre",
        descripcion="Instancia oral final",
        fecha_apertura_reservas=datetime.now(timezone.utc),
        turnos=[
            TurnoColoquioCreate(
                fecha_hora_inicio=fecha_inicio,
                fecha_hora_fin=fecha_fin,
                cupo_maximo=10
            )
        ]
    )

    creada = await service.crear_convocatoria(data)
    assert creada.id is not None
    assert creada.nombre == "Coloquio Final Diciembre"
    assert creada.estado == EstadoConvocatoria.PUBLICADA.value
    assert creada.materia_id == materia_id

    # Verify turno was created
    from sqlalchemy import select
    result = await db_session.execute(select(TurnoColoquio).where(TurnoColoquio.convocatoria_id == creada.id))
    turnos = result.scalars().all()
    assert len(turnos) == 1
    assert turnos[0].cupo_maximo == 10

@pytest.mark.asyncio
async def test_importar_padron_candidatos(db_session, tenant_id):
    service = ColoquioService(db_session, tenant_id)
    materia_id = uuid4()

    # Primero crear la convocatoria
    data = ConvocatoriaColoquioCreate(
        materia_id=materia_id,
        nombre="Coloquio Test Padron",
        turnos=[]
    )
    creada = await service.crear_convocatoria(data)
    
    # Crear un usuario en la DB para que el padron lo encuentre
    alumno_id = uuid4()
    alumno = Usuario(
        id=alumno_id,
        tenant_id=tenant_id,
        nombre="Maria",
        apellido="Gomez",
        email_hash="hash_maria",
        email="maria@test.com",  # Dummy value
        password_hash="xxx",
        activo=True
    )
    db_session.add(alumno)
    await db_session.commit()

    # Generar CSV (email debe coincidir)
    csv_content = b"email,nombre,apellidos\nmaria@test.com,Maria,Gomez\n"

    # Importar
    res = await service.importar_padron_candidatos(creada.id, csv_content)
    assert res == 1

    # Verificar CandidatoColoquio
    from sqlalchemy import select
    result = await db_session.execute(
        select(CandidatoColoquio)
        .where(CandidatoColoquio.convocatoria_id == creada.id)
    )
    candidatos = result.scalars().all()
    assert len(candidatos) == 1
    assert candidatos[0].usuario_id == alumno_id
    assert candidatos[0].habilitado is True

@pytest.mark.asyncio
async def test_importar_padron_error_sin_usuarios(db_session, tenant_id):
    service = ColoquioService(db_session, tenant_id)
    data = ConvocatoriaColoquioCreate(
        materia_id=uuid4(),
        nombre="Coloquio Falla",
        turnos=[]
    )
    creada = await service.crear_convocatoria(data)
    
    csv_content = b"email,nombre,apellidos\nnoexiste@test.com,No,Existe\n"
    
    with pytest.raises(HTTPException) as exc_info:
        await service.importar_padron_candidatos(creada.id, csv_content)
        
    assert exc_info.value.status_code == 400
    assert "No se encontraron usuarios coincidentes" in exc_info.value.detail

@pytest.mark.asyncio
async def test_reservar_coloquio(db_session, tenant_id):
    service = ColoquioService(db_session, tenant_id)
    materia_id = uuid4()

    # Setup: Convocatoria, Turno (cupo 1), Candidato
    data = ConvocatoriaColoquioCreate(
        materia_id=materia_id,
        nombre="Coloquio Reserva",
        turnos=[
            TurnoColoquioCreate(
                fecha_hora_inicio=datetime.now(timezone.utc),
                fecha_hora_fin=datetime.now(timezone.utc) + timedelta(hours=1),
                cupo_maximo=1
            )
        ]
    )
    convocatoria = await service.crear_convocatoria(data)
    
    from sqlalchemy import select
    turno_res = await db_session.execute(select(TurnoColoquio).where(TurnoColoquio.convocatoria_id == convocatoria.id))
    turno = turno_res.scalar_one()

    alumno_id = uuid4()
    candidato = CandidatoColoquio(
        tenant_id=tenant_id,
        convocatoria_id=convocatoria.id,
        usuario_id=alumno_id,
        habilitado=True
    )
    db_session.add(candidato)
    await db_session.commit()

    # Reservar
    from schemas.coloquio import ReservaColoquioRequest
    req = ReservaColoquioRequest(turno_id=turno.id)
    reserva = await service.reservar_coloquio(alumno_id, req)

    assert reserva.id is not None
    assert reserva.turno_id == turno.id
    
    # Verificar cupo agotado
    await db_session.refresh(turno)
    assert turno.cupos_ocupados == 1

    # Intentar reservar de nuevo con otro alumno fallará por cupo
    alumno2_id = uuid4()
    candidato2 = CandidatoColoquio(
        tenant_id=tenant_id,
        convocatoria_id=convocatoria.id,
        usuario_id=alumno2_id,
        habilitado=True
    )
    db_session.add(candidato2)
    await db_session.commit()

    with pytest.raises(HTTPException) as exc:
        await service.reservar_coloquio(alumno2_id, req)
    assert exc.value.status_code == 400
    assert "No hay cupos disponibles" in exc.value.detail
