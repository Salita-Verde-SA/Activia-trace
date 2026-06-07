from pydantic import BaseModel, ConfigDict
import uuid
from models.estructura import EstadoEstructura

class CarreraBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    codigo: str
    nombre: str

class CarreraCreate(CarreraBase):
    pass

class CarreraUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    codigo: str | None = None
    nombre: str | None = None
    estado: EstadoEstructura | None = None

class CarreraResponse(CarreraBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    estado: EstadoEstructura
