import pytest
import uuid
import pyotp
from app.main import app
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import Usuario
from core.security.password import get_password_hash

import pytest_asyncio

@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    print("test_user: starting")
    from models.tenant import Tenant
    tenant_id = uuid.uuid4()
    tenant = Tenant(id=tenant_id, nombre="Test Tenant")
    db_session.add(tenant)
    print("test_user: hashing password")
    password = "MySecurePassword123"
    password_hash = get_password_hash(password)
    user = Usuario(email="test@activiatrace.com", password_hash=password_hash, tenant_id=tenant_id)
    db_session.add(user)
    print("test_user: committing")
    await db_session.commit()
    print("test_user: returning")
    return {"user": user, "password": password}

@pytest.mark.asyncio
async def test_login_success(test_user, client):
    user_data = test_user
    print(f"Created user with email: {user_data['user'].email}")
    response = await client.post(
        "/api/auth/login",
        json={"email": user_data["user"].email, "password": user_data["password"]}
    )
    print(f"Login response: {response.status_code}")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

@pytest.mark.asyncio
async def test_login_invalid_password(test_user, client):
    user_data = test_user
    response = await client.post(
        "/api/auth/login",
        json={"email": user_data["user"].email, "password": "WrongPassword"}
    )
    assert response.status_code == 401
    
@pytest.mark.asyncio
async def test_refresh_token(test_user, client):
    user_data = test_user
    # 1. Login
    login_response = await client.post(
        "/api/auth/login",
        json={"email": user_data["user"].email, "password": user_data["password"]}
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # 2. Refresh
    refresh_response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 200
    new_data = refresh_response.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["refresh_token"] != refresh_token

    # 3. Test token reuse detection
    reuse_response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert reuse_response.status_code == 401
    assert "Token reuse detected" in reuse_response.json()["detail"]

@pytest.mark.asyncio
async def test_login_2fa(test_user, client, db_session):
    user_data = test_user
    # 1. Setup 2FA directly via service or just update the user model
    from services.auth import AuthService
    
    auth_service = AuthService(db_session)
    setup_res = await auth_service.setup_2fa(user_data["user"].id)
    await auth_service.verify_2fa(user_data["user"].id, pyotp.TOTP(setup_res.secret).now())

    # 2. Login, should return pre-auth token
    response = await client.post(
        "/api/auth/login",
        json={"email": user_data["user"].email, "password": user_data["password"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["requires_2fa"] is True
    pre_auth_token = data["pre_auth_token"]
    
    # 3. Complete 2FA login
    totp_code = pyotp.TOTP(setup_res.secret).now()
    response_2fa = await client.post(
        "/api/auth/login/2fa",
        json={"pre_auth_token": pre_auth_token, "code": totp_code}
    )
    assert response_2fa.status_code == 200
    assert "access_token" in response_2fa.json()
