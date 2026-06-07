import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_app_starts_without_error(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
