from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class ColoquioDisponible(BaseModel):
    turno_id: uuid.UUID
    convocatoria_id: uuid.UUID
    materia_id: uuid.UUID
    materia_nombre: str
    nombre_convocatoria: str
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    cupo_total: int
    cupo_disponible: int
    mi_reserva_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class ReservaColoquioRequest(BaseModel):
    turno_id: uuid.UUID

class ReservaColoquioResponse(BaseModel):
    id: uuid.UUID
    turno_id: uuid.UUID
    alumno_id: uuid.UUID
    fecha_reserva: datetime
    estado: str # ej. "Reservada", "Cancelada"

    class Config:
        from_attributes = True

class TurnoColoquioCreate(BaseModel):
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    cupo_maximo: int

class ConvocatoriaColoquioCreate(BaseModel):
    materia_id: uuid.UUID
    nombre: str
    descripcion: Optional[str] = None
    fecha_apertura_reservas: Optional[datetime] = None
    fecha_cierre_reservas: Optional[datetime] = None
    turnos: List[TurnoColoquioCreate]

class ConvocatoriaColoquioResponse(BaseModel):
    id: uuid.UUID
    materia_id: uuid.UUID
    nombre: str
    estado: str
    
    class Config:
        from_attributes = True
