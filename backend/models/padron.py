from sqlalchemy import Column, String, Boolean, text, ForeignKey, DateTime
from core.crypto import EncryptedString
from models.base import Base
from models.mixins import TenantMixin, TimestampMixin, SoftDeleteMixin
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from datetime import datetime, timezone

class VersionPadron(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "version_padron"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    materia_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("materia.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cohorte_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cohorte.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cargado_por: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuario.id", ondelete="RESTRICT"), nullable=False
    )
    cargado_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    activa: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, server_default=text("false")
    )

    # Relaciones
    entradas = relationship("EntradaPadron", back_populates="version", cascade="all, delete-orphan")


class EntradaPadron(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "entrada_padron"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("version_padron.id", ondelete="CASCADE"), nullable=False, index=True
    )
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("usuario.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # Datos desnormalizados del alumno
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(255), nullable=False)
    email = Column(EncryptedString, nullable=False)
    comision: Mapped[str | None] = mapped_column(String(100), nullable=True)
    regional: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relaciones
    version = relationship("VersionPadron", back_populates="entradas")
