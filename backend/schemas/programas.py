from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
import uuid
from models.programas import TipoFechaAcademica

# --- ProgramaMateria Schemas ---

class ProgramaMateriaBase(BaseModel):
    materia_id: uuid.UUID
    carrera_id: Optional[uuid.UUID] = None
    cohorte_id: Optional[uuid.UUID] = None
    referencia_archivo: str
    version: Optional[str] = None

class ProgramaMateriaCreate(ProgramaMateriaBase):
    model_config = ConfigDict(extra='forbid')

class ProgramaMateriaUpdate(BaseModel):
    materia_id: Optional[uuid.UUID] = None
    carrera_id: Optional[uuid.UUID] = None
    cohorte_id: Optional[uuid.UUID] = None
    referencia_archivo: Optional[str] = None
    version: Optional[str] = None
    model_config = ConfigDict(extra='forbid')

class ProgramaMateriaResponse(ProgramaMateriaBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- FechaAcademica Schemas ---

class FechaAcademicaBase(BaseModel):
    materia_id: uuid.UUID
    cohorte_id: Optional[uuid.UUID] = None
    tipo: TipoFechaAcademica
    fecha: date
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    es_feriado: bool = False

class FechaAcademicaCreate(FechaAcademicaBase):
    model_config = ConfigDict(extra='forbid')

class FechaAcademicaUpdate(BaseModel):
    materia_id: Optional[uuid.UUID] = None
    cohorte_id: Optional[uuid.UUID] = None
    tipo: Optional[TipoFechaAcademica] = None
    fecha: Optional[date] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    es_feriado: Optional[bool] = None
    model_config = ConfigDict(extra='forbid')

class FechaAcademicaResponse(FechaAcademicaBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
