from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_maker

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

# RESERVADO para C-0X
async def get_current_user():
    pass

# RESERVADO para C-0X
async def get_tenant():
    pass

# RESERVADO para C-0X
def require_permission(permission: str):
    pass
