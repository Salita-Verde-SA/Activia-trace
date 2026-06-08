from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from models.avisos import SeveridadAviso, AlcanceAviso

class AvisoBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    titulo: str
    cuerpo: str
    severidad: SeveridadAviso = SeveridadAviso.INFO
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    requiere_ack: bool = False
    alcance: AlcanceAviso
    materia_id: Optional[UUID] = None
    cohorte_id: Optional[UUID] = None
    rol_id: Optional[UUID] = None

class AvisoCreate(AvisoBase):
    pass

class AvisoResponse(AvisoBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID

class AvisoAcknowledgmentCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    aviso_id: UUID

class AvisoMetrics(BaseModel):
    model_config = ConfigDict(extra='forbid')
    aviso_id: UUID
    alcance_total: int
    leidos_count: int
    pendientes_count: int
    porcentaje_leidos: float
