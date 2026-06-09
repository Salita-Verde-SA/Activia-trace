import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_maker

async def fix_schema():
    async with async_session_maker() as session:
        for table in ['salarios_base', 'salarios_plus', 'facturas', 'liquidaciones']:
            try:
                await session.execute(text(f"ALTER TABLE {table} ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL"))
                await session.execute(text(f"ALTER TABLE {table} ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL"))
                await session.execute(text(f"ALTER TABLE {table} ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE"))
                print(f"Fixed {table}")
            except Exception as e:
                print(f"Error on {table}: {e}")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(fix_schema())
