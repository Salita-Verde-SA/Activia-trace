from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UsuarioBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)

    email: EmailStr
    nombre: str = Field(..., max_length=255)
    apellido: str = Field(..., max_length=255)
    dni: str | None = Field(None, max_length=50)
    cuil: str | None = Field(None, max_length=50)
    cbu: str | None = Field(None, max_length=50)
    alias_cbu: str | None = Field(None, max_length=255)
    legajo: str | None = Field(None, max_length=100)
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)
    tenant_id: uuid.UUID

class UsuarioUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)

    nombre: str | None = Field(None, max_length=255)
    apellido: str | None = Field(None, max_length=255)
    dni: str | None = Field(None, max_length=50)
    cuil: str | None = Field(None, max_length=50)
    cbu: str | None = Field(None, max_length=50)
    alias_cbu: str | None = Field(None, max_length=255)
    legajo: str | None = Field(None, max_length=100)
    activo: bool | None = None

class UsuarioResponse(UsuarioBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    totp_enabled: bool
    created_at: datetime
    updated_at: datetime

class UsuarioPerfilUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    nombre: str | None = Field(None, max_length=255)
    apellido: str | None = Field(None, max_length=255)
    cbu: str | None = Field(None, max_length=50)
    alias_cbu: str | None = Field(None, max_length=255)
    banco: str | None = Field(None, max_length=100)
    regional: str | None = Field(None, max_length=100)
    modalidad_cobro: str | None = Field(None, max_length=50)
