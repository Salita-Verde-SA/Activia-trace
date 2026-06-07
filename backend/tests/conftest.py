import pytest
import pytest_asyncio
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import NullPool
from httpx import AsyncClient, ASGITransport
from core.config import Settings
from core.database import Base
from core.dependencies import get_db
import models

try:
    from tests.test_repository_base import DummyModel
except ImportError:
    pass
settings = Settings()
TEST_DB_URL = settings.TEST_DATABASE_URL or settings.DATABASE_URL

# NullPool avoids connection reuse issues in tests
test_engine = create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", loop_scope="session")
async def _create_tables():
    """Create all tables once per session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def db_session(_create_tables) -> AsyncGenerator[AsyncSession, None]:
    session = TestSessionLocal()
    try:
        yield session
    finally:
        await session.close()


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    session = TestSessionLocal()
    try:
        yield session
    finally:
        await session.close()


from app.main import app

app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture
async def client(_create_tables) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
