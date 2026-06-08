import pytest
import uuid
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.programas import TipoFechaAcademica

@pytest.fixture
def mock_ids():
    return {
        "materia_id": uuid.uuid4(),
        "carrera_id": uuid.uuid4(),
        "cohorte_id": uuid.uuid4(),
        "tenant_id": uuid.uuid4(),
    }

# We'll use E2E tests for the routers, which inherently tests the services/repositories if not mocked.
# Wait, let's write E2E tests using TestClient and mocked dependencies if necessary,
# but the rules say: "Tests sin mocks de DB. Usar base real o contenedor de test (DB efímera). Mockear la base de datos invalida el test."

@pytest.mark.asyncio
async def test_create_programa(client: TestClient, db_session: AsyncSession):
    # This requires a tenant, materia, etc. in DB.
    # For now, just a placeholder to show structure.
    pass
