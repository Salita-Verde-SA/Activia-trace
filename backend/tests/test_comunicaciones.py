import pytest
from uuid import uuid4
from schemas.comunicacion import LoteCreate, ComunicacionCreate
from services.comunicaciones import ComunicacionService
from models.comunicacion import Comunicacion, EstadoComunicacion

TENANT_ID = uuid4()
ACTOR_ID = uuid4()

@pytest.mark.asyncio
async def test_cifrado_y_encolado(mocker):
    mock_db = mocker.AsyncMock()
    
    lote_data = LoteCreate(
        comunicaciones=[
            ComunicacionCreate(destinatario="test@test.com", asunto="A", cuerpo="C")
        ]
    )
    
    lote_id = await ComunicacionService.encolar_lote(mock_db, TENANT_ID, lote_data)
    
    assert lote_id is not None
    mock_db.add_all.assert_called_once()
    mock_db.commit.assert_called_once()
    
    args, _ = mock_db.add_all.call_args
    comunicaciones = args[0]
    assert len(comunicaciones) == 1
    assert comunicaciones[0].estado == EstadoComunicacion.PENDIENTE
    assert comunicaciones[0].aprobado is False

@pytest.mark.asyncio
async def test_aprobar_lote(mocker):
    mock_db = mocker.AsyncMock()
    mock_result = mocker.Mock()
    mock_result.rowcount = 1
    mock_db.execute.return_value = mock_result
    
    rowcount = await ComunicacionService.aprobar_lote(mock_db, TENANT_ID, uuid4(), ACTOR_ID)
    
    assert rowcount == 1
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_previsualizar_lote_endpoints(mocker):
    from api.endpoints.comunicaciones import previsualizar_lote
    from models.user import Usuario
    
    mock_svc = mocker.patch("api.endpoints.comunicaciones.ComunicacionService.obtener_pendientes_por_lote")
    actor = Usuario(id=ACTOR_ID, tenant_id=TENANT_ID)
    
    mock_svc.return_value = [
        Comunicacion(
            id=uuid4(), lote_id=uuid4(), destinatario_cifrado="test@test.com", 
            asunto="A", cuerpo="C", estado=EstadoComunicacion.PENDIENTE
        )
    ]
    
    res = await previsualizar_lote(uuid4(), mocker.AsyncMock(), actor)
    assert len(res) == 1
    assert res[0].destinatario == "test@test.com"
