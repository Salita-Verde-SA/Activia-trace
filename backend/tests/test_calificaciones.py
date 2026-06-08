import pytest
from uuid import uuid4
from services.calificacion import CalificacionService
from models.calificacion import UmbralMateria

TENANT_ID = uuid4()
MATERIA_ID = uuid4()

def test_calcular_aprobacion_sin_umbral():
    # Numérica: asume 60% por defecto
    assert CalificacionService.calcular_aprobacion(60.0, None, None) is True
    assert CalificacionService.calcular_aprobacion(59.9, None, None) is False
    # Textual: sin umbral explícito, por defecto no aprueba ninguna palabra
    assert CalificacionService.calcular_aprobacion(None, "aprobado", None) is False

def test_calcular_aprobacion_con_umbral():
    umbral = UmbralMateria(umbral_pct=70.0, valores_aprobatorios=["satisfactorio", "excelente"])
    
    assert CalificacionService.calcular_aprobacion(70.0, None, umbral) is True
    assert CalificacionService.calcular_aprobacion(69.9, None, umbral) is False
    
    assert CalificacionService.calcular_aprobacion(None, "Satisfactorio", umbral) is True
    assert CalificacionService.calcular_aprobacion(None, " EXCELENTE ", umbral) is True
    assert CalificacionService.calcular_aprobacion(None, "Regular", umbral) is False

@pytest.mark.asyncio
async def test_preview_importacion():
    csv_content = b"email,nombre,calificacion_tp1,estado\ntest@test.com,Juan,8,Aprobado\n"
    preview = CalificacionService.generar_vista_previa(csv_content)
    
    assert preview.total_filas == 1
    assert len(preview.columnas_detectadas) == 4
    
    col_email = next(c for c in preview.columnas_detectadas if c.nombre_columna == "email")
    assert col_email.ignorar is True
    
    col_cal = next(c for c in preview.columnas_detectadas if c.nombre_columna == "calificacion_tp1")
    assert col_cal.ignorar is False
    assert col_cal.es_numerica is True

@pytest.mark.asyncio
async def test_endpoint_configurar_umbral(mocker):
    from api.endpoints.calificaciones import configurar_umbral
    from schemas.calificacion import UmbralCreate
    from models.user import Usuario
    
    mock_set_umbral = mocker.patch("api.endpoints.calificaciones.UmbralService.set_umbral")
    mock_set_umbral.return_value = UmbralMateria(materia_id=MATERIA_ID, umbral_pct=65.0)
    
    actor = Usuario(id=uuid4(), tenant_id=TENANT_ID)
    data = UmbralCreate(materia_id=MATERIA_ID, umbral_pct=65.0)
    
    result = await configurar_umbral(data=data, db=mocker.AsyncMock(), actor=actor)
    assert result.umbral_pct == 65.0
    mock_set_umbral.assert_called_once()
