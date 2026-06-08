from sqlalchemy import Column, String, Boolean, text, UniqueConstraint
from core.crypto import EncryptedString
from models.base import Base
from models.mixins import TenantMixin, TimestampMixin, SoftDeleteMixin
import uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PGUUID

class Usuario(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "usuario"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Datos base y auth
    email = Column(EncryptedString, nullable=False)
    email_hash = Column(String, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    
    # PII Cifrada
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    dni = Column(EncryptedString, nullable=True)
    cuil = Column(EncryptedString, nullable=True)
    cbu = Column(EncryptedString, nullable=True)
    alias_cbu = Column(EncryptedString, nullable=True)
    asignaciones = relationship('Asignacion', back_populates='usuario', cascade='all, delete-orphan')
    hilos_participa = relationship('HiloMensajeInterno', secondary='hilo_usuario', back_populates='participantes')
    
    # Datos de negocio
    legajo = Column(String, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))

    # 2FA
    totp_enabled = Column(Boolean, nullable=False, server_default=text("false"))
    totp_secret = Column(EncryptedString, nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "email_hash", name="uq_usuario_tenant_email"),
    )
