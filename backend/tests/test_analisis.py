import pytest
from uuid import uuid4
from services.analisis import AnalisisService
from models.calificacion import Calificacion
from models.padron import EntradaPadron, VersionPadron

TENANT_ID = uuid4()
MATERIA_ID = uuid4()
VERSION_ID = uuid4()

@pytest.mark.asyncio
async def test_obtener_alumnos_atrasados(mocker):
    mock_get = mocker.patch("services.analisis.AnalisisService._get_calificaciones_padron_activo")
    
    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    e2 = EntradaPadron(id=uuid4(), email="e2@test.com", nombre="E2")
    entradas = [e1, e2]
    
    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", aprobado=True),
        Calificacion(entrada_padron_id=e2.id, actividad_nombre="TP1", aprobado=False)
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
    
    e1 = EntradaPadron(id=uuid4(), email="e1@test.com", nombre="E1")
    entradas = [e1]
    
    calificaciones = [
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP1", aprobado=True),
        Calificacion(entrada_padron_id=e1.id, actividad_nombre="TP2", aprobado=False)
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
async def test_endpoints_rbac(mocker):
    from api.endpoints.analisis import reporte_atrasados
    from models.user import Usuario
    
    mock_svc = mocker.patch("api.endpoints.analisis.AnalisisService.obtener_alumnos_atrasados")
    actor = Usuario(id=uuid4(), tenant_id=TENANT_ID)
    
    await reporte_atrasados(MATERIA_ID, mocker.AsyncMock(), actor)
    mock_svc.assert_called_once()
