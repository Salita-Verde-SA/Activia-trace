import uuid
from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from models.base import Base
from models.mixins import TimestampMixin, TenantMixin, SoftDeleteMixin

class Asignacion(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'asignacion'

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    usuario_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    rol_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('rol.id', ondelete='CASCADE'), nullable=False)
    
    # Contexto académico opcional
    materia_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey('materia.id', ondelete='CASCADE'), nullable=True)
    carrera_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey('carrera.id', ondelete='CASCADE'), nullable=True)
    cohorte_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey('cohorte.id', ondelete='CASCADE'), nullable=True)
    
    # Jerarquía
    responsable_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='SET NULL'), nullable=True)
    
    # Vigencia
    desde = Column(DateTime(timezone=True), nullable=False)
    hasta = Column(DateTime(timezone=True), nullable=True)

    rol = relationship("Rol")
    materia = relationship("Materia")

    # Nota: El estado de vigencia será un property o método que evaluará "desde <= now <= hasta (o null)"
