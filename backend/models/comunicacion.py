from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Enum, Text, ForeignKey, CheckConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base
from core.crypto import EncryptedString
from datetime import datetime
import enum

class EstadoComunicacion(str, enum.Enum):
    PENDIENTE = "Pendiente"
    ENVIANDO = "Enviando"
    ENVIADO = "Enviado"
    ERROR = "Error"
    CANCELADO = "Cancelado"

class Comunicacion(Base):
    __tablename__ = "comunicaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    lote_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    destinatario_cifrado = Column(EncryptedString, nullable=False)
    asunto = Column(String(255), nullable=False)
    cuerpo = Column(Text, nullable=False)
    estado = Column(Enum(EstadoComunicacion), nullable=False, default=EstadoComunicacion.PENDIENTE, index=True)
    aprobado = Column(Boolean, nullable=False, default=False, index=True)
    fecha_envio = Column(DateTime(timezone=True), nullable=True)
    error_msg = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "estado != 'Error' OR error_msg IS NOT NULL",
            name="chk_error_msg_if_error"
        ),
    )
