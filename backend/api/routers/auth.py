from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db
from schemas.auth import LoginRequest, TokenResponse, RefreshRequest, TwoFactorLoginRequest
from services.auth import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """
    Inicia sesión validando email y password.
    Si 2FA está habilitado, devuelve un pre_auth_token.
    """
    return await auth_service.login(request)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, auth_service: AuthService = Depends(get_auth_service)):
    """
    Rota el token de refresco, emitiendo un nuevo par de access y refresh tokens.
    """
    return await auth_service.refresh_token(request.refresh_token)

@router.post("/login/2fa", response_model=TokenResponse)
async def login_2fa(request: TwoFactorLoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """
    Verifica el código 2FA usando el pre_auth_token.
    """
    return await auth_service.login_2fa(request.pre_auth_token, request.code)

from schemas.auth import TwoFactorSetupResponse, TwoFactorVerifyRequest
from api.dependencies.auth import get_current_user, CurrentUser

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    auth_service: AuthService = Depends(get_auth_service),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Genera el secreto y URI para configurar TOTP en la app autenticadora."""
    return await auth_service.setup_2fa(current_user.id)

@router.post("/2fa/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    auth_service: AuthService = Depends(get_auth_service),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Verifica el código y activa TOTP para la cuenta del usuario."""
    await auth_service.verify_2fa(current_user.id, request.code)
    return {"status": "success", "message": "2FA habilitado correctamente"}

from schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Solicita la recuperación de contraseña generando un token."""
    await auth_service.forgot_password(request.email)
    return {"status": "success", "message": "If the email is registered, a recovery token was generated."}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Establece una nueva contraseña usando el token de recuperación."""
    await auth_service.reset_password(request.token, request.new_password)
    return {"status": "success", "message": "Password updated successfully"}

from schemas.auth import ImpersonateRequest
from api.dependencies.auth import require_permission

@router.post("/impersonate", response_model=TokenResponse)
async def impersonate(
    request: ImpersonateRequest,
    auth_service: AuthService = Depends(get_auth_service),
    current_user: CurrentUser = Depends(require_permission("impersonacion:usar"))
):
    """Genera un token de suplantación para operar como target_user_id."""
    return await auth_service.impersonate(current_user.id, request.target_user_id)
