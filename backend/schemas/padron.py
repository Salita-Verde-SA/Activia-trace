from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime

class EntradaPadronBase(BaseModel):
    nombre: str
    apellidos: str
    email: str
    comision: str | None = None
    regional: str | None = None

class EntradaPadronCreate(EntradaPadronBase):
    model_config = ConfigDict(extra="forbid")

class EntradaPadronResponse(EntradaPadronBase):
    id: UUID
    version_id: UUID
    usuario_id: UUID | None
    
    model_config = ConfigDict(from_attributes=True)

class VersionPadronBase(BaseModel):
    materia_id: UUID
    cohorte_id: UUID

class VersionPadronCreate(VersionPadronBase):
    model_config = ConfigDict(extra="forbid")
    entradas: list[EntradaPadronCreate] = Field(default_factory=list)

class VersionPadronResponse(VersionPadronBase):
    id: UUID
    cargado_por: UUID
    cargado_at: datetime
    activa: bool
    
    model_config = ConfigDict(from_attributes=True)
