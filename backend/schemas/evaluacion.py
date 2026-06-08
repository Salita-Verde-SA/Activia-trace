from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from models.evaluaciones import TipoEvaluacion, EstadoReserva

class EvaluacionBase(BaseModel):
    model_config = ConfigDict(extra='forbid')
    materia_id: UUID
    cohorte_id: UUID
    tipo: TipoEvaluacion
    instancia: str
    dias_disponibles: int = Field(default=1, ge=1)

class EvaluacionCreate(EvaluacionBase):
    pass

class EvaluacionResponse(EvaluacionBase):
    id: UUID
    tenant_id: UUID

class EvaluacionMetrics(BaseModel):
    model_config = ConfigDict(extra='forbid')
    evaluacion_id: UUID
    total_inscriptos: int
    total_presentados: int
    total_ausentes: int
    porcentaje_aprobados: float

class ReservaImport(BaseModel):
    model_config = ConfigDict(extra='forbid')
    alumnos_ids: List[UUID]
    fecha_hora: datetime

class ReservaResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    evaluacion_id: UUID
    alumno_id: UUID
    fecha_hora: datetime
    estado: EstadoReserva

class ResultadoCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    alumno_id: UUID
    nota_final: str

class ResultadoResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: UUID
    evaluacion_id: UUID
    alumno_id: UUID
    nota_final: str
