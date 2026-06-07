from pydantic import BaseModel, ConfigDict
from datetime import date
import uuid
from models.estructura import EstadoEstructura

class CohorteBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    carrera_id: uuid.UUID
    nombre: str
    anio: int
    vig_desde: date
    vig_hasta: date | None = None

class CohorteCreate(CohorteBase):
    pass

class CohorteUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    nombre: str | None = None
    anio: int | None = None
    vig_desde: date | None = None
    vig_hasta: date | None = None
    estado: EstadoEstructura | None = None

class CohorteResponse(CohorteBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    estado: EstadoEstructura
