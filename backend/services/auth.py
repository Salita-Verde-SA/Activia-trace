import uuid
import pyotp
import secrets
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from core.security.password import verify_password
from core.security.jwt import create_access_token, decode_access_token
from repositories.usuario import UsuarioRepository
from repositories.session import SessionRepository
from schemas.auth import LoginRequest, TokenResponse, TwoFactorSetupResponse

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.usuario_repo = UsuarioRepository(db)
        self.session_repo = SessionRepository(db)

    async def login(self, request: LoginRequest) -> TokenResponse:
        user = await self.usuario_repo.get_by_email_cross_tenant(request.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        if user.totp_enabled:
            # Requires 2FA step
            # We issue a short-lived pre-auth token
            pre_auth_token = create_access_token(
                data={"sub": str(user.id), "type": "pre-auth"},
                expires_delta=timedelta(minutes=5)
            )
            return TokenResponse(
                access_token="",
                requires_2fa=True,
                pre_auth_token=pre_auth_token
            )

        return await self._issue_tokens(user)

    async def login_2fa(self, pre_auth_token: str, code: str) -> TokenResponse:
        try:
            payload = decode_access_token(pre_auth_token)
            if payload.get("type") != "pre-auth":
                raise ValueError("Invalid token type")
            user_id = uuid.UUID(payload.get("sub"))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired pre-auth token")

        # Bypass tenant scoping for auth resolution
        self.usuario_repo.tenant_id = None 
        # Wait, get by id needs tenant_id. We can just use standard select or add get_by_id_cross_tenant
        from models.user import Usuario
        from sqlalchemy import select
        stmt = select(Usuario).where(Usuario.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalars().first()

        if not user or not user.totp_secret:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user or 2FA not configured")

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid 2FA code")

        return await self._issue_tokens(user)

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        session = await self.session_repo.get_by_token(refresh_token)
        if not session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        if session.revoked_at:
            # Refresh token reuse detected! Revoke all tokens for this user.
            await self.session_repo.revoke_all_for_user(session.user_id)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token reuse detected. All sessions revoked.")

        if session.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        # Rotamos el token (lo revocamos y emitimos uno nuevo)
        await self.session_repo.revoke_token(refresh_token)

        # Get user
        from models.user import Usuario
        from sqlalchemy import select
        stmt = select(Usuario).where(Usuario.id == session.user_id)
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        
        if not user:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return await self._issue_tokens(user)

    async def _issue_tokens(self, user) -> TokenResponse:
        from models.rbac import UsuarioRol, Rol
        from sqlalchemy import select
        
        stmt = select(Rol.nombre).join(UsuarioRol).where(UsuarioRol.usuario_id == user.id)
        result = await self.db.execute(stmt)
        roles = result.scalars().all()

        # Emit access token
        access_token = create_access_token(
            data={"sub": str(user.id), "tenant_id": str(user.tenant_id), "roles": roles}
        )

        # Generate refresh token
        refresh_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await self.session_repo.create_session(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )

    async def setup_2fa(self, user_id: uuid.UUID) -> TwoFactorSetupResponse:
        secret = pyotp.random_base32()
        
        from models.user import Usuario
        from sqlalchemy import select, update
        
        # Guardamos el secreto pero no habilitamos todavía
        stmt = update(Usuario).where(Usuario.id == user_id).values(totp_secret=secret)
        await self.db.execute(stmt)
        await self.db.commit()

        # Fetch user email for provisioning URI
        stmt_select = select(Usuario).where(Usuario.id == user_id)
        result = await self.db.execute(stmt_select)
        user = result.scalars().first()
        
        totp = pyotp.TOTP(secret)
        # We need an issuer name
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="Activia Trace")
        
        return TwoFactorSetupResponse(secret=secret, qr_code_url=provisioning_uri)

    async def verify_2fa(self, user_id: uuid.UUID, code: str) -> bool:
        from models.user import Usuario
        from sqlalchemy import select, update
        
        stmt_select = select(Usuario).where(Usuario.id == user_id)
        result = await self.db.execute(stmt_select)
        user = result.scalars().first()
        
        if not user or not user.totp_secret:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA setup not initiated")

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid 2FA code")
            
        # Habilitamos el 2FA
        stmt_update = update(Usuario).where(Usuario.id == user_id).values(totp_enabled=True)
        await self.db.execute(stmt_update)
        await self.db.commit()
        return True

    async def forgot_password(self, email: str) -> None:
        user = await self.usuario_repo.get_by_email_cross_tenant(email)
        if not user:
            # We don't want to leak whether the user exists, so we just return
            return
            
        # Generate token
        token_str = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        from models.recovery_token import RecoveryToken
        db_obj = RecoveryToken(user_id=user.id, token=token_str, expires_at=expires_at)
        self.db.add(db_obj)
        await self.db.commit()
        
        # En el futuro, se encolaría un envío de email asíncrono con el token_str
        # print(f"Recovery token for {email}: {token_str}")
        return

    async def reset_password(self, token: str, new_password: str) -> None:
        from models.recovery_token import RecoveryToken
        from models.user import Usuario
        from sqlalchemy import select, update
        from core.security.password import get_password_hash
        
        stmt = select(RecoveryToken).where(RecoveryToken.token == token)
        result = await self.db.execute(stmt)
        recovery_token = result.scalars().first()
        
        if not recovery_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
            
        if recovery_token.used_at:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token already used")
            
        if recovery_token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")
            
        # Update user password
        password_hash = get_password_hash(new_password)
        stmt_update_user = update(Usuario).where(Usuario.id == recovery_token.user_id).values(password_hash=password_hash)
        await self.db.execute(stmt_update_user)
        
        # Mark token as used
        stmt_update_token = update(RecoveryToken).where(RecoveryToken.id == recovery_token.id).values(used_at=datetime.now(timezone.utc))
        await self.db.execute(stmt_update_token)
        
        await self.db.commit()

    async def impersonate(self, impersonator_id: uuid.UUID, target_user_id: uuid.UUID) -> TokenResponse:
        from models.user import Usuario
        from sqlalchemy import select
        
        self.usuario_repo.tenant_id = None
        stmt = select(Usuario).where(Usuario.id == target_user_id)
        result = await self.db.execute(stmt)
        target_user = result.scalars().first()
        
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")
            
        access_token = create_access_token(
            data={
                "sub": str(target_user.id), 
                "tenant_id": str(target_user.tenant_id), 
                "impersonator_id": str(impersonator_id)
            }
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=None
        )
