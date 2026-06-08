from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from models.comunicacion import EstadoComunicacion

class ComunicacionCreate(BaseModel):
    destinatario: str
    asunto: str
    cuerpo: str

class LoteCreate(BaseModel):
    comunicaciones: List[ComunicacionCreate]

class ComunicacionResponse(BaseModel):
    id: UUID
    lote_id: UUID
    destinatario: str
    asunto: str
    cuerpo: str
    estado: EstadoComunicacion
    fecha_envio: Optional[datetime] = None
    error_msg: Optional[str] = None

class LoteResponse(BaseModel):
    lote_id: UUID
    comunicaciones: List[ComunicacionResponse]
