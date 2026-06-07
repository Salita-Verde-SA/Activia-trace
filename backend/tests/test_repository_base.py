import pytest
import uuid
from sqlalchemy import Column, String
from sqlalchemy.ext.asyncio import AsyncSession

from models.base import Base
from models.mixins import TimestampMixin, SoftDeleteMixin, TenantMixin
from repositories.base import BaseRepository

class DummyModel(TimestampMixin, SoftDeleteMixin, TenantMixin, Base):
    __tablename__ = 'dummy_model'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)

class DummyRepository(BaseRepository[DummyModel]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        super().__init__(DummyModel, session, tenant_id)

@pytest.fixture
async def setup_dummies(db_session: AsyncSession):
    # Need to create table for dummy model
    async with db_session.bind.begin() as conn:
        await conn.run_sync(DummyModel.__table__.create, checkfirst=True)
    yield
    async with db_session.bind.begin() as conn:
        await conn.run_sync(DummyModel.__table__.drop, checkfirst=True)

@pytest.mark.asyncio
async def test_repository_tenant_isolation(db_session: AsyncSession, setup_dummies):
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    
    # Create tenants first to satisfy FK
    from models.tenant import Tenant
    db_session.add(Tenant(id=tenant_a_id, nombre="Tenant A"))
    db_session.add(Tenant(id=tenant_b_id, nombre="Tenant B"))
    await db_session.commit()
    
    repo_a = DummyRepository(db_session, tenant_a_id)
    repo_b = DummyRepository(db_session, tenant_b_id)
    
    # Create records
    await repo_a.create(name="A1")
    await repo_a.create(name="A2")
    
    await repo_b.create(name="B1")
    
    # Assert repo A only sees A records
    list_a = await repo_a.list()
    assert len(list_a) == 2
    assert all(d.tenant_id == tenant_a_id for d in list_a)
    
    # Assert repo B only sees B records
    list_b = await repo_b.list()
    assert len(list_b) == 1
    assert list_b[0].name == "B1"
    assert list_b[0].tenant_id == tenant_b_id

@pytest.mark.asyncio
async def test_repository_soft_delete(db_session: AsyncSession, setup_dummies):
    tenant_id = uuid.uuid4()
    
    # Create tenant first
    from models.tenant import Tenant
    db_session.add(Tenant(id=tenant_id, nombre="Tenant A"))
    await db_session.commit()
    
    repo = DummyRepository(db_session, tenant_id)
    
    # Create a record
    record = await repo.create(name="To Delete")
    record_id = record.id
    
    # Assert it is visible
    list_before = await repo.list()
    assert len(list_before) == 1
    
    # Delete it
    deleted = await repo.delete(record_id)
    assert deleted is True
    
    # Verify it is no longer visible in list
    list_after = await repo.list()
    assert len(list_after) == 0
    
    # Verify it is not visible in get
    got_record = await repo.get(record_id)
    assert got_record is None
    
    # Verify it still exists in DB with deleted_at set (bypassing repo)
    from sqlalchemy import select
    stmt = select(DummyModel).where(DummyModel.id == record_id)
    result = await db_session.execute(stmt)
    raw_record = result.scalars().first()
    
    assert raw_record is not None
    assert raw_record.deleted_at is not None
