from uuid import uuid4
import enum
from sqlalchemy import Column, String, DateTime, Date, Time, Enum, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class DiaSemana(str, enum.Enum):
    LUNES = "Lunes"
    MARTES = "Martes"
    MIERCOLES = "Miércoles"
    JUEVES = "Jueves"
    VIERNES = "Viernes"
    SABADO = "Sábado"
    DOMINGO = "Domingo"

class EstadoInstancia(str, enum.Enum):
    PROGRAMADO = "Programado"
    REALIZADO = "Realizado"
    CANCELADO = "Cancelado"

class EstadoGuardia(str, enum.Enum):
    PENDIENTE = "Pendiente"
    REALIZADA = "Realizada"
    CANCELADA = "Cancelada"

class SlotEncuentro(Base):
    __tablename__ = "slots_encuentros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    asignacion_id = Column(UUID(as_uuid=True), ForeignKey("asignaciones.id"), nullable=False, index=True)
    materia_id = Column(UUID(as_uuid=True), ForeignKey("materias.id"), nullable=False, index=True)
    titulo = Column(String(255), nullable=False)
    hora = Column(Time, nullable=False)
    dia_semana = Column(Enum(DiaSemana), nullable=True) # Nulo si es fecha única
    fecha_inicio = Column(Date, nullable=True) # Nulo si es fecha única
    cant_semanas = Column(Integer, nullable=False, default=0) # 0 si es única
    fecha_unica = Column(Date, nullable=True) # Nulo si es recurrente
    meet_url = Column(String(255), nullable=True)
    vig_desde = Column(Date, nullable=True)
    vig_hasta = Column(Date, nullable=True)

class InstanciaEncuentro(Base):
    __tablename__ = "instancias_encuentros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("slots_encuentros.id"), nullable=True, index=True)
    materia_id = Column(UUID(as_uuid=True), ForeignKey("materias.id"), nullable=False, index=True)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    titulo = Column(String(255), nullable=False)
    estado = Column(Enum(EstadoInstancia), nullable=False, default=EstadoInstancia.PROGRAMADO)
    meet_url = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    comentario = Column(Text, nullable=True)

class Guardia(Base):
    __tablename__ = "guardias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    asignacion_id = Column(UUID(as_uuid=True), ForeignKey("asignaciones.id"), nullable=False, index=True)
    materia_id = Column(UUID(as_uuid=True), ForeignKey("materias.id"), nullable=False, index=True)
    carrera_id = Column(UUID(as_uuid=True), ForeignKey("carreras.id"), nullable=True)
    cohorte_id = Column(UUID(as_uuid=True), ForeignKey("cohortes.id"), nullable=True)
    dia = Column(Enum(DiaSemana), nullable=False)
    horario = Column(String(50), nullable=False) # ej: "14:00-14:45"
    estado = Column(Enum(EstadoGuardia), nullable=False, default=EstadoGuardia.PENDIENTE)
    comentarios = Column(Text, nullable=True)
    creada_at = Column(DateTime(timezone=True), nullable=False)
