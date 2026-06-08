from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .usuario import UsuarioResponse

class MensajeInternoBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    contenido: str = Field(..., min_length=1)

class MensajeInternoCreate(MensajeInternoBase):
    pass

class MensajeInternoResponse(MensajeInternoBase):
    id: UUID
    hilo_id: UUID
    emisor_id: Optional[UUID]
    leido: bool
    created_at: datetime

class HiloMensajeInternoBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    asunto: Optional[str] = Field(None, max_length=255)

class HiloCreate(HiloMensajeInternoBase):
    mensaje_inicial: str = Field(..., min_length=1)
    destinatarios_ids: List[UUID] = Field(..., min_length=1)

class HiloResponse(HiloMensajeInternoBase):
    id: UUID
    creado_por_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    participantes: List[UsuarioResponse]
    mensajes: List[MensajeInternoResponse] = []
    
class HiloListResponse(HiloMensajeInternoBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    ultimo_mensaje: Optional[str] = None
    no_leidos_count: int = 0
