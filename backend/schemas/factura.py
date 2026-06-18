from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from models.liquidaciones import EstadoFactura

class FacturaBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    usuario_id: UUID
    periodo_mes: int
    periodo_anio: int
    monto: float
    detalle: Optional[str] = None
    comprobante_url: Optional[str] = None

class FacturaCreate(FacturaBase):
    pass

class FacturaResponse(FacturaBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID
    estado: EstadoFactura
    created_at: datetime
    updated_at: datetime
