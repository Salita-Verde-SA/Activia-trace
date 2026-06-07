from pydantic import BaseModel, ConfigDict, EmailStr
import uuid

class LoginRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None
    requires_2fa: bool = False
    pre_auth_token: str | None = None

class RefreshRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    refresh_token: str

class TwoFactorSetupResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    secret: str
    qr_code_url: str

class TwoFactorVerifyRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    code: str

class TwoFactorLoginRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    pre_auth_token: str
    code: str

class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    token: str
    new_password: str

class ImpersonateRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    target_user_id: uuid.UUID

