import uuid
import enum
from datetime import date
from sqlalchemy import String, Integer, ForeignKey, Date, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

class EstadoEstructura(str, enum.Enum):
    ACTIVA = "Activa"
    INACTIVA = "Inactiva"

class Carrera(Base):
    __tablename__ = "carrera"
    __table_args__ = (
        UniqueConstraint("tenant_id", "codigo", name="uq_carrera_tenant_codigo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenant.id"), nullable=False, index=True)
    codigo: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[EstadoEstructura] = mapped_column(
        Enum(EstadoEstructura, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoEstructura.ACTIVA
    )

    cohortes: Mapped[list["Cohorte"]] = relationship(back_populates="carrera", cascade="all, delete-orphan")


class Cohorte(Base):
    __tablename__ = "cohorte"
    __table_args__ = (
        UniqueConstraint("tenant_id", "carrera_id", "nombre", name="uq_cohorte_tenant_carrera_nombre"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenant.id"), nullable=False, index=True)
    carrera_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("carrera.id"), nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    vig_desde: Mapped[date] = mapped_column(Date, nullable=False)
    vig_hasta: Mapped[date | None] = mapped_column(Date, nullable=True)
    estado: Mapped[EstadoEstructura] = mapped_column(
        Enum(EstadoEstructura, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoEstructura.ACTIVA
    )

    carrera: Mapped["Carrera"] = relationship(back_populates="cohortes")


class Materia(Base):
    __tablename__ = "materia"
    __table_args__ = (
        UniqueConstraint("tenant_id", "codigo", name="uq_materia_tenant_codigo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenant.id"), nullable=False, index=True)
    codigo: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[EstadoEstructura] = mapped_column(
        Enum(EstadoEstructura, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoEstructura.ACTIVA
    )
