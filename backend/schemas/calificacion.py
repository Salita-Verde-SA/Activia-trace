from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import List, Dict, Any

class UmbralBase(BaseModel):
    materia_id: UUID
    docente_id: UUID | None = None
    umbral_pct: float = Field(default=60.0, ge=0.0, le=100.0)
    valores_aprobatorios: List[str] = Field(default_factory=list)

class UmbralCreate(UmbralBase):
    model_config = ConfigDict(extra="forbid")

class UmbralResponse(UmbralBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)

class ColumnMap(BaseModel):
    nombre_columna: str
    es_numerica: bool
    ignorar: bool = False

class PreviewResponse(BaseModel):
    columnas_detectadas: List[ColumnMap]
    total_filas: int
    preview_data: List[Dict[str, Any]]

class ImportConfirmRequest(BaseModel):
    materia_id: UUID
    cohorte_id: UUID
    version_padron_id: UUID
    columnas: List[ColumnMap]
    es_reporte_finalizacion: bool = False
    
    model_config = ConfigDict(extra="forbid")

class CalificacionResponse(BaseModel):
    id: UUID
    entrada_padron_id: UUID
    actividad_nombre: str
    nota_numerica: float | None = None
    nota_textual: str | None = None
    aprobado: bool
    origen: str
    
    model_config = ConfigDict(from_attributes=True)
