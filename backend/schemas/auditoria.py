from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class AuditoriaFiltro(BaseModel):
    model_config = ConfigDict(extra='forbid')
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    actor_id: Optional[UUID] = None
    accion: Optional[str] = None
    materia_id: Optional[UUID] = None
    limit: int = Field(default=50, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)

class AuditoriaRegistro(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID
    fecha_hora: datetime
    actor_id: UUID
    impersonado_id: Optional[UUID] = None
    materia_id: Optional[UUID] = None
    accion: str
    detalle: Optional[Dict[str, Any]] = None
    filas_afectadas: int
    ip: Optional[str] = None
    user_agent: Optional[str] = None

class AuditoriaRespuesta(BaseModel):
    model_config = ConfigDict(extra='forbid')
    total: int
    limit: int
    offset: int
    items: List[AuditoriaRegistro]

class MetricaDiaria(BaseModel):
    model_config = ConfigDict(extra='forbid')
    fecha: str
    cantidad: int

class MetricaUsuario(BaseModel):
    model_config = ConfigDict(extra='forbid')
    actor_id: UUID
    estado: str
    cantidad: int

class AuditoriaMetricas(BaseModel):
    model_config = ConfigDict(extra='forbid')
    por_dia: List[MetricaDiaria]
    por_usuario: List[MetricaUsuario]
