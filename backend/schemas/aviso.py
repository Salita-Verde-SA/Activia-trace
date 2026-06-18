from pydantic import BaseModel, ConfigDict, Field, model_validator
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
    usuario_id: Optional[UUID] = None

class AvisoCreate(AvisoBase):
    @model_validator(mode='after')
    def _coherencia_alcance(self):
        if self.alcance == AlcanceAviso.USUARIO:
            if self.usuario_id is None:
                raise ValueError("alcance USUARIO requiere usuario_id")
            if self.materia_id or self.cohorte_id or self.rol_id:
                raise ValueError("alcance USUARIO no admite materia_id/cohorte_id/rol_id")
        elif self.usuario_id is not None:
            raise ValueError("usuario_id solo es válido con alcance USUARIO")
        return self

class AvisoResponse(AvisoBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID

class ContactarAlumnoRequest(BaseModel):
    """Contacto in-app a un alumno en riesgo: crea un aviso dirigido (alcance USUARIO)."""
    model_config = ConfigDict(extra='forbid')
    usuario_id: UUID
    titulo: str
    cuerpo: str

class AvisoAlumnoResponse(BaseModel):
    """Aviso tal como lo consume el portal del alumno ("Mis Avisos" / notificaciones)."""
    model_config = ConfigDict(extra='forbid')
    id: UUID
    aviso_id: UUID
    titulo: str
    contenido: str
    fecha_publicacion: datetime
    requiere_ack: bool
    ack_at: Optional[datetime] = None

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
