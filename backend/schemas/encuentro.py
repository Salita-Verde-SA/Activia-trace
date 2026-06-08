from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from datetime import date, time
from typing import Optional, List
from models.encuentros import DiaSemana, EstadoInstancia

class SlotEncuentroCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    materia_id: UUID
    titulo: str = Field(..., max_length=255)
    hora: time
    dia_semana: Optional[DiaSemana] = None
    fecha_inicio: Optional[date] = None
    cant_semanas: int = Field(default=0, ge=0, le=25)
    fecha_unica: Optional[date] = None
    meet_url: Optional[str] = Field(None, max_length=255)

class SlotEncuentroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    asignacion_id: UUID
    materia_id: UUID
    titulo: str
    hora: time
    dia_semana: Optional[DiaSemana]
    fecha_inicio: Optional[date]
    cant_semanas: int
    fecha_unica: Optional[date]
    meet_url: Optional[str]
    vig_desde: Optional[date]
    vig_hasta: Optional[date]

class InstanciaEncuentroUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    estado: Optional[EstadoInstancia] = None
    meet_url: Optional[str] = Field(None, max_length=255)
    video_url: Optional[str] = Field(None, max_length=255)
    comentario: Optional[str] = None

class InstanciaEncuentroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    slot_id: Optional[UUID]
    materia_id: UUID
    fecha: date
    hora: time
    titulo: str
    estado: EstadoInstancia
    meet_url: Optional[str]
    video_url: Optional[str]
    comentario: Optional[str]

class EncuentroRecurrenteResponse(BaseModel):
    slot: SlotEncuentroResponse
    instancias: List[InstanciaEncuentroResponse]
