from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from models.tareas import EstadoTarea, PrioridadTarea

# Comentarios
class ComentarioTareaBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    texto: str

class ComentarioTareaCreate(ComentarioTareaBase):
    pass

class ComentarioTareaResponse(ComentarioTareaBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tarea_id: UUID
    usuario_id: UUID
    fecha_hora: datetime

# Tareas
class TareaBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    titulo: str
    descripcion: Optional[str] = None
    prioridad: PrioridadTarea = PrioridadTarea.MEDIUM
    asignado_a: UUID
    contexto_id: Optional[UUID] = None

class TareaCreate(TareaBase):
    pass

class TareaResponse(TareaBase):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    tenant_id: UUID
    estado: EstadoTarea
    asignado_por: UUID
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    comentarios: List[ComentarioTareaResponse] = []

class TareaUpdateEstado(BaseModel):
    model_config = ConfigDict(extra='forbid')
    estado: EstadoTarea
    comentario: Optional[str] = None
