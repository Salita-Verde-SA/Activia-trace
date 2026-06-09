from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date

class SalarioBaseBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    rol: str
    monto: float
    fecha_desde: date
    fecha_hasta: Optional[date] = None

class SalarioBaseCreate(SalarioBaseBase):
    pass

class SalarioBaseResponse(SalarioBaseBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID

class SalarioPlusBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    clave_plus: str
    rol: str
    monto: float
    fecha_desde: date
    fecha_hasta: Optional[date] = None

class SalarioPlusCreate(SalarioPlusBase):
    pass

class SalarioPlusResponse(SalarioPlusBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID
