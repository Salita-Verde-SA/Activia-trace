import enum
import uuid
from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime, timezone

class SeveridadAviso(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class AlcanceAviso(str, enum.Enum):
    GLOBAL = "GLOBAL"
    MATERIA = "MATERIA"
    COHORTE = "COHORTE"
    ROL = "ROL"

class Aviso(Base):
    __tablename__ = "avisos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    titulo = Column(String, nullable=False)
    cuerpo = Column(Text, nullable=False)
    severidad = Column(Enum(SeveridadAviso, name="severidad_aviso_enum"), nullable=False, default=SeveridadAviso.INFO)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    fecha_fin = Column(DateTime(timezone=True), nullable=True)
    requiere_ack = Column(Boolean, nullable=False, default=False)
    
    alcance = Column(Enum(AlcanceAviso, name="alcance_aviso_enum"), nullable=False)
    materia_id = Column(UUID(as_uuid=True), nullable=True)
    cohorte_id = Column(UUID(as_uuid=True), nullable=True)
    rol_id = Column(UUID(as_uuid=True), nullable=True)

    acknowledgments = relationship("AcknowledgmentAviso", back_populates="aviso", cascade="all, delete-orphan")

class AcknowledgmentAviso(Base):
    __tablename__ = "acknowledgments_avisos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    aviso_id = Column(UUID(as_uuid=True), ForeignKey("avisos.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    fecha_hora = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    aviso = relationship("Aviso", back_populates="acknowledgments")
    usuario = relationship("Usuario")
