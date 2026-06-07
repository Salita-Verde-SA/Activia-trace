import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_200_with_db_up(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "up"


@pytest.mark.asyncio
async def test_health_reports_db_down_on_failure(client: AsyncClient, monkeypatch):
    from sqlalchemy.ext.asyncio import AsyncSession

    original_execute = AsyncSession.execute

    async def fake_execute(self, *args, **kwargs):
        raise ConnectionError("DB is down")

    monkeypatch.setattr(AsyncSession, "execute", fake_execute)

    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "down"

    monkeypatch.setattr(AsyncSession, "execute", original_execute)
