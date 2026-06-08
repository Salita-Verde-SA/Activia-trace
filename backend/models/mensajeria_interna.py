from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from .base import Base

hilo_usuario_table = Table(
    'hilo_usuario', Base.metadata,
    Column('hilo_id', PGUUID(as_uuid=True), ForeignKey('hilo_mensaje_interno.id', ondelete='CASCADE'), primary_key=True),
    Column('usuario_id', PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='CASCADE'), primary_key=True)
)

class HiloMensajeInterno(Base):
    __tablename__ = 'hilo_mensaje_interno'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    asunto = Column(String(255), nullable=True)
    creado_por_id = Column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    participantes = relationship('Usuario', secondary=hilo_usuario_table, back_populates='hilos_participa')
    creador = relationship('Usuario', foreign_keys=[creado_por_id])
    mensajes = relationship('MensajeInterno', back_populates='hilo', cascade='all, delete-orphan')

class MensajeInterno(Base):
    __tablename__ = 'mensaje_interno'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    hilo_id = Column(PGUUID(as_uuid=True), ForeignKey('hilo_mensaje_interno.id', ondelete='CASCADE'), nullable=False, index=True)
    emisor_id = Column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='SET NULL'), nullable=True)
    contenido = Column(String, nullable=False)
    leido = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    hilo = relationship('HiloMensajeInterno', back_populates='mensajes')
    emisor = relationship('Usuario', foreign_keys=[emisor_id])
