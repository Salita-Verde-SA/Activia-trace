from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class ColoquioBase(BaseModel):
    materia_id: uuid.UUID
    fecha: datetime
    cupo_total: int

class ColoquioDisponible(ColoquioBase):
    id: uuid.UUID
    materia_nombre: str
    cupo_disponible: int

    class Config:
        from_attributes = True

class ReservaColoquioRequest(BaseModel):
    coloquio_id: uuid.UUID

class ReservaColoquioResponse(BaseModel):
    id: uuid.UUID
    coloquio_id: uuid.UUID
    alumno_id: uuid.UUID
    fecha_reserva: datetime
    estado: str # ej. "CONFIRMADA", "CANCELADA"

    class Config:
        from_attributes = True
