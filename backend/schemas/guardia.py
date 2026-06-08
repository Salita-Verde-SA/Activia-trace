from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from models.encuentros import DiaSemana, EstadoGuardia

class GuardiaCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    materia_id: UUID
    carrera_id: Optional[UUID] = None
    cohorte_id: Optional[UUID] = None
    dia: DiaSemana
    horario: str = Field(..., max_length=50)
    comentarios: Optional[str] = None

class GuardiaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    asignacion_id: UUID
    materia_id: UUID
    carrera_id: Optional[UUID]
    cohorte_id: Optional[UUID]
    dia: DiaSemana
    horario: str
    estado: EstadoGuardia
    comentarios: Optional[str]
    creada_at: datetime
