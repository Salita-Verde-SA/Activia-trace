from pydantic import BaseModel
from uuid import UUID
from typing import List, Dict

class CalificacionSimplificada(BaseModel):
    actividad_nombre: str
    nota_numerica: float | None = None
    nota_textual: str | None = None
    aprobado: bool

class AlumnoAtrasado(BaseModel):
    entrada_padron_id: UUID
    email: str
    nombre: str | None = None
    apellido: str | None = None
    actividades_no_aprobadas: List[CalificacionSimplificada]

class ReporteAtrasadosResponse(BaseModel):
    materia_id: UUID
    total_alumnos_padron: int
    total_alumnos_atrasados: int
    alumnos_atrasados: List[AlumnoAtrasado]

class ActividadRanking(BaseModel):
    actividad_nombre: str
    total_evaluados: int
    total_aprobados: int
    porcentaje_aprobacion: float

class RankingActividadesResponse(BaseModel):
    materia_id: UUID
    actividades: List[ActividadRanking]

class SabanaAlumno(BaseModel):
    entrada_padron_id: UUID
    email: str
    nombre: str | None = None
    apellido: str | None = None
    calificaciones: Dict[str, CalificacionSimplificada] # key: actividad_nombre

class SabanaResponse(BaseModel):
    materia_id: UUID
    actividades_headers: List[str]
    alumnos: List[SabanaAlumno]
