from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from models.liquidaciones import EstadoLiquidacion

class LiquidacionBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    usuario_id: UUID
    periodo_mes: int
    periodo_anio: int

class LiquidacionCreate(LiquidacionBase):
    pass

class LiquidacionPrecalculo(BaseModel):
    model_config = ConfigDict(extra='forbid')
    usuario_id: UUID
    periodo_mes: int
    periodo_anio: int
    monto_base: float
    monto_plus: float
    monto_total: float
    es_nexo: bool
    excluido_por_factura: bool
    detalle_calculo: Dict[str, Any]

class LiquidacionResponse(LiquidacionPrecalculo):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID
    estado: EstadoLiquidacion
    created_at: datetime
    updated_at: datetime
