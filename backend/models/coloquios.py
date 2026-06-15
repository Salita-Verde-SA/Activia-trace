import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from models.base import Base
from models.mixins import TenantMixin, TimestampMixin, SoftDeleteMixin

class EstadoConvocatoria(str, enum.Enum):
    BORRADOR = "Borrador"
    PUBLICADA = "Publicada"
    CERRADA = "Cerrada"
    CANCELADA = "Cancelada"

class ConvocatoriaColoquio(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "convocatoria_coloquio"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    materia_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("materia.id"), nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String, nullable=True)
    
    fecha_apertura_reservas: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    fecha_cierre_reservas: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    estado: Mapped[EstadoConvocatoria] = mapped_column(
        Enum(EstadoConvocatoria, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoConvocatoria.BORRADOR
    )

    # Relationship to Materia
    materia = relationship("Materia") 
    turnos: Mapped[list["TurnoColoquio"]] = relationship("TurnoColoquio", back_populates="convocatoria", cascade="all, delete-orphan")


class EstadoTurno(str, enum.Enum):
    ACTIVO = "Activo"
    CANCELADO = "Cancelado"

class TurnoColoquio(Base, TenantMixin, TimestampMixin):
    __tablename__ = "turno_coloquio"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    convocatoria_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("convocatoria_coloquio.id"), nullable=False, index=True)
    
    fecha_hora_inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fecha_hora_fin: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    cupo_maximo: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    cupos_ocupados: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    estado: Mapped[EstadoTurno] = mapped_column(
        Enum(EstadoTurno, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoTurno.ACTIVO
    )

    convocatoria: Mapped["ConvocatoriaColoquio"] = relationship("ConvocatoriaColoquio", back_populates="turnos")


class CandidatoColoquio(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "candidato_coloquio"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    convocatoria_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("convocatoria_coloquio.id"), nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuario.id"), nullable=False, index=True)
    
    nota_previa: Mapped[str | None] = mapped_column(String(50), nullable=True)
    habilitado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    convocatoria: Mapped["ConvocatoriaColoquio"] = relationship("ConvocatoriaColoquio")
    usuario = relationship("Usuario")

from sqlalchemy import UniqueConstraint

class EstadoReserva(str, enum.Enum):
    RESERVADA = "Reservada"
    CANCELADA = "Cancelada"
    ASISTIO = "Asistió"
    NO_ASISTIO = "No Asistió"

class ReservaColoquio(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reserva_coloquio"
    __table_args__ = (
        UniqueConstraint("tenant_id", "convocatoria_id", "usuario_id", name="uq_reserva_coloquio_usuario"),
    )

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    convocatoria_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("convocatoria_coloquio.id"), nullable=False, index=True)
    turno_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("turno_coloquio.id"), nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuario.id"), nullable=False, index=True)
    
    estado: Mapped[EstadoReserva] = mapped_column(
        Enum(EstadoReserva, native_enum=False, length=20), 
        nullable=False, 
        default=EstadoReserva.RESERVADA
    )

    turno: Mapped["TurnoColoquio"] = relationship("TurnoColoquio")
    usuario = relationship("Usuario")
    convocatoria: Mapped["ConvocatoriaColoquio"] = relationship("ConvocatoriaColoquio")
