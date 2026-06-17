import pytest
from uuid import uuid4
from services.analisis import AnalisisService
from models.calificacion import Calificacion, UmbralMateria
from models.padron import EntradaPadron, VersionPadron

TENANT_ID = uuid4()
MATERIA_ID = uuid4()
VERSION_ID = uuid4()


def _patch_umbral(mocker, umbral_pct=60.0, valores=None):
    """Stub UmbralService.get_umbral so analysis services recompute against a fixed umbral."""
    umbral = UmbralMateria(umbral_pct=umbral_pct, valores_aprobatorios=valores or [])
    return mocker.patch(
        "services.analisis.UmbralService.get_umbral",
        new_callable=mocker.AsyncMock,
        return_value=umbral,
    )


@pytest.mark.asyncio
async def test_obtener_alumnos_atrasados(mocker):
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    _patch_umbral(mocker, umbral_pct=60.0)

    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    e2 = EntradaPadron(id=uuid4(), email="e2@test.com", nombre="E2")
    entradas = [e1, e2]

    # e1 aprueba (70 >= 60), e2 no (40 < 60). El flag almacenado es irrelevante: se recalcula.
    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", nota_numerica=7.0, aprobado=True),
        Calificacion(entrada_padron_id=e2.id, actividad_nombre="TP1", nota_numerica=4.0, aprobado=False),
    ]

    mock_get.return_value = (entradas, calificaciones)

    res = await AnalisisService.obtener_alumnos_atrasados(mocker.AsyncMock(), TENANT_ID, MATERIA_ID)

    assert res.total_alumnos_padron == 2
    assert res.total_alumnos_atrasados == 1
    assert len(res.alumnos_atrasados) == 1
    assert res.alumnos_atrasados[0].entrada_padron_id == e2.id
    assert len(res.alumnos_atrasados[0].actividades_no_aprobadas) == 1
    assert res.alumnos_atrasados[0].actividades_no_aprobadas[0].actividad_nombre == "TP1"

@pytest.mark.asyncio
async def test_obtener_sabana_notas(mocker):
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    _patch_umbral(mocker, umbral_pct=60.0)

    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    entradas = [e1]

    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", nota_numerica=7.0, aprobado=True),
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP2", nota_numerica=4.0, aprobado=False),
    ]

    mock_get.return_value = (entradas, calificaciones)

    res = await AnalisisService.obtener_sabana_notas(mocker.AsyncMock(), TENANT_ID, MATERIA_ID)

    assert len(res.actividades_headers) == 2
    assert "TP1" in res.actividades_headers
    assert "TP2" in res.actividades_headers
    assert len(res.alumnos) == 1
    assert "TP1" in res.alumnos[0].calificaciones
    assert res.alumnos[0].calificaciones["TP1"].aprobado is True


@pytest.mark.asyncio
async def test_sabana_recalcula_aprobado_con_umbral_actual(mocker):
    """Regresión: al subir el umbral, la sábana debe reprobar notas que antes aprobaban,
    ignorando el flag `aprobado` persistido en import."""
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    # Umbral ahora en 80%: 7.0 (=70) reprueba, 9.0 (=90) aprueba.
    _patch_umbral(mocker, umbral_pct=80.0)

    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    calificaciones = [
        # Flags almacenados al importar con umbral viejo (60%) — ahora obsoletos.
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", nota_numerica=7.0, aprobado=True),
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP2", nota_numerica=9.0, aprobado=False),
    ]
    mock_get.return_value = ([e1], calificaciones)

    res = await AnalisisService.obtener_sabana_notas(mocker.AsyncMock(), TENANT_ID, MATERIA_ID)

    califs = res.alumnos[0].calificaciones
    assert califs["TP1"].aprobado is False  # 70 < 80, pese a aprobado=True almacenado
    assert califs["TP2"].aprobado is True    # 90 >= 80, pese a aprobado=False almacenado


@pytest.mark.asyncio
async def test_sabana_recalcula_valores_textuales(mocker):
    """Triangulación textual: el umbral de valores textuales también manda sobre el flag almacenado."""
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    _patch_umbral(mocker, umbral_pct=60.0, valores=["Aprobado"])

    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="Coloquio", nota_textual="Aprobado", aprobado=False),
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="Recup", nota_textual="Ausente", aprobado=True),
    ]
    mock_get.return_value = ([e1], calificaciones)

    res = await AnalisisService.obtener_sabana_notas(mocker.AsyncMock(), TENANT_ID, MATERIA_ID)

    califs = res.alumnos[0].calificaciones
    assert califs["Coloquio"].aprobado is True   # "Aprobado" ∈ valores aprobatorios
    assert califs["Recup"].aprobado is False     # "Ausente" ∉ valores aprobatorios


@pytest.mark.asyncio
async def test_ranking_recalcula_aprobado_con_umbral_actual(mocker):
    """El ranking de aprobación por actividad también recalcula contra el umbral vigente."""
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    _patch_umbral(mocker, umbral_pct=80.0)

    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    e2 = EntradaPadron(id=uuid4(), email="e2@test.com", nombre="E2")
    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", nota_numerica=9.0, aprobado=True),
        Calificacion(entrada_padron_id=e2.id, actividad_nombre="TP1", nota_numerica=7.0, aprobado=True),  # 70 < 80
    ]
    mock_get.return_value = ([e1, e2], calificaciones)

    res = await AnalisisService.obtener_ranking_actividades(mocker.AsyncMock(), TENANT_ID, MATERIA_ID)

    tp1 = next(a for a in res.actividades if a.actividad_nombre == "TP1")
    assert tp1.total_evaluados == 2
    assert tp1.total_aprobados == 1            # solo e1 supera 80
    assert tp1.porcentaje_aprobacion == 50.0
    
@pytest.mark.asyncio
async def test_endpoints_rbac(mocker):
    from api.endpoints.analisis import reporte_atrasados
    from models.user import Usuario
    
    mock_svc = mocker.patch("api.endpoints.analisis.AnalisisService.obtener_alumnos_atrasados")
    actor = Usuario(id=uuid4(), tenant_id=TENANT_ID)
    
    await reporte_atrasados(MATERIA_ID, mocker.AsyncMock(), actor)
    mock_svc.assert_called_once()
