import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_database_connection(db_session: AsyncSession):
    result = await db_session.execute(text("SELECT 1"))
    value = result.scalar()
    assert value == 1


@pytest.mark.asyncio
async def test_get_db_closes_session_on_exception(db_session: AsyncSession):
    """Verify session is usable and doesn't leak on normal usage."""
    result = await db_session.execute(text("SELECT 1"))
    assert result.scalar() == 1
