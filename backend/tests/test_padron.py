import pytest
from uuid import uuid4
from schemas.padron import EntradaPadronCreate
from services.padron import PadronService
from integrations.moodle_ws import MoodleClient, MoodleAPIError
from models.padron import VersionPadron
from models.audit import AuditLog
from sqlalchemy import select

TENANT_ID = uuid4()
MATERIA_ID = uuid4()
COHORTE_ID = uuid4()
ACTOR_ID = uuid4()

@pytest.mark.asyncio
async def test_crear_version_padron_desactiva_anterior(db_session):
    entradas_v1 = [
        EntradaPadronCreate(nombre="Juan", apellidos="Perez", email="juan@test.com")
    ]
    v1 = await PadronService.crear_version_padron(
        db=db_session,
        tenant_id=TENANT_ID,
        actor_id=ACTOR_ID,
        materia_id=MATERIA_ID,
        cohorte_id=COHORTE_ID,
        entradas_data=entradas_v1
    )
    
    assert v1.activa is True
    
    entradas_v2 = [
        EntradaPadronCreate(nombre="Maria", apellidos="Gomez", email="maria@test.com")
    ]
    v2 = await PadronService.crear_version_padron(
        db=db_session,
        tenant_id=TENANT_ID,
        actor_id=ACTOR_ID,
        materia_id=MATERIA_ID,
        cohorte_id=COHORTE_ID,
        entradas_data=entradas_v2
    )
    
    assert v2.activa is True
    
    await db_session.refresh(v1)
    assert v1.activa is False

class MockResponse:
    def __init__(self, json_data, status_code=200):
        self._json_data = json_data
        self.status_code = status_code

    def json(self):
        return self._json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            import httpx
            raise httpx.HTTPStatusError("Error", request=None, response=self)

@pytest.mark.asyncio
async def test_moodle_client_error_encubierto(mocker):
    client = MoodleClient(base_url="http://moodle.test", token="dummy")
    
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_post.return_value = MockResponse({
        "exception": "moodle_exception",
        "errorcode": "invalidtoken",
        "message": "Token inválido"
    })
    
    with pytest.raises(MoodleAPIError) as exc:
        await client.fetch_padron(course_id=1)
        
    assert "Token inválido" in str(exc.value)

@pytest.mark.asyncio
async def test_vaciar_padron(db_session):
    v1 = await PadronService.crear_version_padron(
        db=db_session,
        tenant_id=TENANT_ID,
        actor_id=ACTOR_ID,
        materia_id=MATERIA_ID,
        cohorte_id=COHORTE_ID,
        entradas_data=[EntradaPadronCreate(nombre="Test", apellidos="Test", email="test@test.com")]
    )
    
    eliminados = await PadronService.vaciar_padron(
        db=db_session,
        tenant_id=TENANT_ID,
        actor_id=ACTOR_ID,
        materia_id=MATERIA_ID,
        cohorte_id=COHORTE_ID
    )
    
    assert eliminados == 1
    
    await db_session.refresh(v1)
    assert v1.activa is False
    assert v1.deleted_at is not None
    
    stmt = select(AuditLog).where(
        AuditLog.accion == "PADRON_VACIAR",
        AuditLog.tenant_id == TENANT_ID
    )
    result = await db_session.execute(stmt)
    audit = result.scalars().first()
    assert audit is not None
    assert audit.filas_afectadas == 1
