import uuid
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from models.base import Base
from models.mixins import TimestampMixin, TenantMixin, SoftDeleteMixin

class Permiso(Base, TimestampMixin):
    __tablename__ = 'permiso'
    
    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

class Rol(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'rol'
    
    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'nombre', name='uq_rol_tenant_nombre'),
    )

class RolPermiso(Base, TenantMixin, TimestampMixin):
    __tablename__ = 'rol_permiso'
    
    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rol_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('rol.id', ondelete='CASCADE'), nullable=False)
    permiso_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('permiso.id', ondelete='CASCADE'), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('rol_id', 'permiso_id', name='uq_rol_permiso'),
    )

class UsuarioRol(Base, TenantMixin, TimestampMixin):
    __tablename__ = 'usuario_rol'

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    rol_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('rol.id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        UniqueConstraint('usuario_id', 'rol_id', name='uq_usuario_rol'),
    )
