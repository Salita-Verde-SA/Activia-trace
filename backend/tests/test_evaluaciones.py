import pytest
from uuid import uuid4
from datetime import datetime, timezone
from models.evaluaciones import Evaluacion, ReservaEvaluacion, ResultadoEvaluacion, TipoEvaluacion, EstadoReserva
from models.user import Usuario
from models.calificacion import UmbralMateria
from schemas.evaluacion import EvaluacionCreate, ReservaImport, ResultadoCreate
from services.evaluaciones import EvaluacionService

@pytest.mark.asyncio
async def test_crear_y_listar_evaluacion(db_session, tenant_id):
    service = EvaluacionService(db_session, tenant_id)
    materia_id = uuid4()
    cohorte_id = uuid4()

    data = EvaluacionCreate(
        materia_id=materia_id,
        cohorte_id=cohorte_id,
        tipo=TipoEvaluacion.COLOQUIO,
        instancia="Coloquio Diciembre",
        dias_disponibles=3
    )

    creada = await service.crear_evaluacion(data)
    assert creada.id is not None
    assert creada.tipo == TipoEvaluacion.COLOQUIO

    lista = await service.listar_globales()
    assert len(lista) == 1
    assert lista[0].id == creada.id

@pytest.mark.asyncio
async def test_importar_reservas(db_session, tenant_id):
    service = EvaluacionService(db_session, tenant_id)
    eval_id = uuid4()
    
    # Crear eval
    evaluacion = Evaluacion(
        id=eval_id,
        tenant_id=tenant_id,
        materia_id=uuid4(),
        cohorte_id=uuid4(),
        tipo=TipoEvaluacion.PARCIAL,
        instancia="Parcial 1",
        dias_disponibles=1
    )
    db_session.add(evaluacion)

    # Crear alumno
    alumno_id = uuid4()
    alumno = Usuario(
        id=alumno_id,
        tenant_id=tenant_id,
        nombre="Juan",
        apellidos="Perez",
        email="juan@test.com",
        dni="123",
        cuil="123",
        cbu="123",
        alias_cbu="123",
        banco="Test",
        facturador=False
    )
    db_session.add(alumno)
    await db_session.commit()

    import_data = ReservaImport(
        alumnos_ids=[alumno_id, uuid4()], # One exists, one doesn't
        fecha_hora=datetime.now(timezone.utc)
    )

    reservas = await service.importar_reservas(eval_id, import_data)
    assert len(reservas) == 1 # Only the valid user was added
    assert reservas[0].alumno_id == alumno_id
    assert reservas[0].estado == EstadoReserva.ACTIVA

@pytest.mark.asyncio
async def test_metricas_evaluacion(db_session, tenant_id):
    service = EvaluacionService(db_session, tenant_id)
    eval_id = uuid4()
    materia_id = uuid4()
    
    # Crear eval
    evaluacion = Evaluacion(
        id=eval_id,
        tenant_id=tenant_id,
        materia_id=materia_id,
        cohorte_id=uuid4(),
        tipo=TipoEvaluacion.PARCIAL,
        instancia="Parcial 1",
        dias_disponibles=1
    )
    db_session.add(evaluacion)

    # Crear umbral
    umbral = UmbralMateria(
        id=uuid4(),
        tenant_id=tenant_id,
        asignacion_id=uuid4(),
        materia_id=materia_id,
        umbral_pct=60,
        valores_aprobatorios=["Aprobado"]
    )
    db_session.add(umbral)

    alumno1 = uuid4()
    alumno2 = uuid4()
    alumno3 = uuid4()

    db_session.add_all([
        ReservaEvaluacion(id=uuid4(), tenant_id=tenant_id, evaluacion_id=eval_id, alumno_id=alumno1, fecha_hora=datetime.now(timezone.utc)),
        ReservaEvaluacion(id=uuid4(), tenant_id=tenant_id, evaluacion_id=eval_id, alumno_id=alumno2, fecha_hora=datetime.now(timezone.utc)),
        ReservaEvaluacion(id=uuid4(), tenant_id=tenant_id, evaluacion_id=eval_id, alumno_id=alumno3, fecha_hora=datetime.now(timezone.utc))
    ])

    db_session.add_all([
        ResultadoEvaluacion(id=uuid4(), tenant_id=tenant_id, evaluacion_id=eval_id, alumno_id=alumno1, nota_final="8"), # Aprobado
        ResultadoEvaluacion(id=uuid4(), tenant_id=tenant_id, evaluacion_id=eval_id, alumno_id=alumno2, nota_final="4")  # Desaprobado
        # alumno3 ausente
    ])
    await db_session.commit()

    metricas = await service.obtener_metricas(eval_id)
    assert metricas.total_inscriptos == 3
    assert metricas.total_presentados == 2
    assert metricas.total_ausentes == 1
    # 1 aprobado de 2 presentados = 50.0%
    assert metricas.porcentaje_aprobados == 50.0
