import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.base import BaseRepository
from models.session import Session
from models.mixins import utc_now

class SessionRepository(BaseRepository[Session]):
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID | None = None):
        self.session = session
        self.model_class = Session
        if tenant_id:
            super().__init__(Session, session, tenant_id)

    async def get_by_token(self, token: str) -> Session | None:
        stmt = select(Session).where(Session.token == token)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_session(self, user_id: uuid.UUID, token: str, expires_at) -> Session:
        db_obj = Session(user_id=user_id, token=token, expires_at=expires_at)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def revoke_token(self, token: str) -> None:
        from models.mixins import utc_now
        stmt = update(Session).where(Session.token == token).values(revoked_at=utc_now())
        await self.session.execute(stmt)
        await self.session.commit()

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        from models.mixins import utc_now
        stmt = update(Session).where(Session.user_id == user_id, Session.revoked_at.is_(None)).values(revoked_at=utc_now())
        await self.session.execute(stmt)
        await self.session.commit()
