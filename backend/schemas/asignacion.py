from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field

class AsignacionBase(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)

    usuario_id: uuid.UUID
    rol_id: uuid.UUID
    
    materia_id: uuid.UUID | None = None
    carrera_id: uuid.UUID | None = None
    cohorte_id: uuid.UUID | None = None
    responsable_id: uuid.UUID | None = None
    
    desde: datetime
    hasta: datetime | None = None

class AsignacionCreate(AsignacionBase):
    tenant_id: str

class AsignacionUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)

    materia_id: uuid.UUID | None = None
    carrera_id: uuid.UUID | None = None
    cohorte_id: uuid.UUID | None = None
    responsable_id: uuid.UUID | None = None
    desde: datetime | None = None
    hasta: datetime | None = None

class AsignacionResponse(AsignacionBase):
    id: uuid.UUID
    tenant_id: str
    created_at: datetime
    updated_at: datetime

class DocenteAsignacionInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    usuario_id: uuid.UUID
    rol_id: uuid.UUID
    responsable_id: uuid.UUID | None = None

class AsignacionMasivaCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    docentes: list[DocenteAsignacionInput]
    materia_id: uuid.UUID | None = None
    carrera_id: uuid.UUID | None = None
    cohorte_id: uuid.UUID | None = None
    desde: datetime
    hasta: datetime | None = None

class EquipoDocenteView(BaseModel):
    model_config = ConfigDict(extra='forbid', from_attributes=True)
    asignacion_id: uuid.UUID
    usuario_id: uuid.UUID
    usuario_nombre: str
    usuario_apellido: str
    usuario_email_hash: str | None = None
    rol_id: uuid.UUID
    rol_nombre: str
    materia_id: uuid.UUID | None = None
    carrera_id: uuid.UUID | None = None
    cohorte_id: uuid.UUID | None = None
    desde: datetime
    hasta: datetime | None = None

class ClonadoEquipoRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    materia_id: uuid.UUID | None = None
    carrera_id: uuid.UUID | None = None
    cohorte_id_origen: uuid.UUID
    cohorte_id_destino: uuid.UUID
    nuevo_desde: datetime
    nuevo_hasta: datetime | None = None

class AsignacionVigenciaUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    asignacion_ids: list[uuid.UUID]
    nuevo_desde: datetime | None = None
    nuevo_hasta: datetime | None = None
