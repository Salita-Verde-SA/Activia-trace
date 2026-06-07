from pydantic import BaseModel, ConfigDict
import uuid
from models.estructura import EstadoEstructura

class MateriaBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    codigo: str
    nombre: str

class MateriaCreate(MateriaBase):
    pass

class MateriaUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    codigo: str | None = None
    nombre: str | None = None
    estado: EstadoEstructura | None = None

class MateriaResponse(MateriaBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    estado: EstadoEstructura
