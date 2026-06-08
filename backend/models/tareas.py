import enum
import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
from datetime import datetime, timezone

class EstadoTarea(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    EN_PROGRESO = "EN_PROGRESO"
    RESUELTA = "RESUELTA"
    CANCELADA = "CANCELADA"

class PrioridadTarea(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    titulo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    prioridad = Column(Enum(PrioridadTarea, name="prioridad_tarea_enum"), nullable=False, default=PrioridadTarea.MEDIUM)
    estado = Column(Enum(EstadoTarea, name="estado_tarea_enum"), nullable=False, default=EstadoTarea.PENDIENTE)
    
    asignado_a = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False, index=True)
    asignado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    contexto_id = Column(UUID(as_uuid=True), nullable=True)
    
    fecha_creacion = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    comentarios = relationship("ComentarioTarea", back_populates="tarea", cascade="all, delete-orphan")

class ComentarioTarea(Base):
    __tablename__ = "comentarios_tareas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    tarea_id = Column(UUID(as_uuid=True), ForeignKey("tareas.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    texto = Column(Text, nullable=False)
    fecha_hora = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    tarea = relationship("Tarea", back_populates="comentarios")
    usuario = relationship("Usuario")
