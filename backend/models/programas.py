import uuid
import enum
from datetime import date
from sqlalchemy import String, Integer, ForeignKey, Date, Enum, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.mixins import TimestampMixin, SoftDeleteMixin, TenantMixin

class ProgramaMateria(Base, TimestampMixin, SoftDeleteMixin, TenantMixin):
    __tablename__ = "programa_materia"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    materia_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("materia.id"), nullable=False, index=True)
    carrera_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("carrera.id"), nullable=True, index=True)
    cohorte_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cohorte.id"), nullable=True, index=True)
    
    referencia_archivo: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[str | None] = mapped_column(String(50), nullable=True)

    materia: Mapped["Materia"] = relationship("Materia")
    carrera: Mapped["Carrera"] = relationship("Carrera")
    cohorte: Mapped["Cohorte"] = relationship("Cohorte")


class TipoFechaAcademica(str, enum.Enum):
    PARCIAL = "Parcial"
    RECUPERATORIO = "Recuperatorio"
    TP = "Trabajo Practico"
    COLOQUIO = "Coloquio"
    FINAL = "Final"
    OTRO = "Otro"

class FechaAcademica(Base, TimestampMixin, SoftDeleteMixin, TenantMixin):
    __tablename__ = "fecha_academica"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    materia_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("materia.id"), nullable=False, index=True)
    cohorte_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cohorte.id"), nullable=True, index=True)
    
    tipo: Mapped[TipoFechaAcademica] = mapped_column(
        Enum(TipoFechaAcademica, native_enum=False, length=50), 
        nullable=False
    )
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    titulo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    es_feriado: Mapped[bool] = mapped_column(default=False, nullable=False)

    materia: Mapped["Materia"] = relationship("Materia")
    cohorte: Mapped["Cohorte"] = relationship("Cohorte")
