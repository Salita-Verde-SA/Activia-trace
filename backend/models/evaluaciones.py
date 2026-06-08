import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base

class TipoEvaluacion(str, enum.Enum):
    PARCIAL = "Parcial"
    TP = "TP"
    COLOQUIO = "Coloquio"
    RECUPERATORIO = "Recuperatorio"

class EstadoReserva(str, enum.Enum):
    ACTIVA = "Activa"
    CANCELADA = "Cancelada"

class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    materia_id = Column(UUID(as_uuid=True), nullable=False)
    cohorte_id = Column(UUID(as_uuid=True), nullable=False)
    tipo = Column(Enum(TipoEvaluacion, name="tipo_evaluacion_enum"), nullable=False)
    instancia = Column(String, nullable=False)
    dias_disponibles = Column(Integer, nullable=False, default=1)

    reservas = relationship("ReservaEvaluacion", back_populates="evaluacion", cascade="all, delete-orphan")
    resultados = relationship("ResultadoEvaluacion", back_populates="evaluacion", cascade="all, delete-orphan")

class ReservaEvaluacion(Base):
    __tablename__ = "reservas_evaluaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    evaluacion_id = Column(UUID(as_uuid=True), ForeignKey("evaluaciones.id"), nullable=False)
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    estado = Column(Enum(EstadoReserva, name="estado_reserva_enum"), nullable=False, default=EstadoReserva.ACTIVA)

    evaluacion = relationship("Evaluacion", back_populates="reservas")
    alumno = relationship("Usuario", foreign_keys=[alumno_id])

class ResultadoEvaluacion(Base):
    __tablename__ = "resultados_evaluaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    evaluacion_id = Column(UUID(as_uuid=True), ForeignKey("evaluaciones.id"), nullable=False)
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    nota_final = Column(String, nullable=False)

    evaluacion = relationship("Evaluacion", back_populates="resultados")
    alumno = relationship("Usuario", foreign_keys=[alumno_id])
