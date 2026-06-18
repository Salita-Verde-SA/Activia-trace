import sys
import os
import uuid
import asyncio

# Add backend directory to sys.path to import local modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.security.jwt import create_access_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.config import settings


from sqlalchemy import text

async def test_materias():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(text("SELECT id, tenant_id FROM usuario LIMIT 1"))
        row = result.fetchone()
        
        if not row:
            print("No user found")
            return
            
        user_id, tenant_id = row
        print(f"Testing with user: {user_id}, tenant: {tenant_id}")
        
        token_data = {
            "sub": str(user_id),
            "tenant_id": str(tenant_id),
            "roles": ["COORDINADOR", "ADMIN"]
        }
        token = create_access_token(token_data)
        
        import httpx
        async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
            resp = await client.get("/api/admin/materias", headers={"Authorization": f"Bearer {token}"})
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_materias())
