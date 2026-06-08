import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from models.base import Base
from models.mixins import TenantMixin, TimestampMixin, SoftDeleteMixin

class UmbralMateria(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'umbral_materia'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    materia_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    docente_id = Column(UUID(as_uuid=True), index=True, nullable=True) # Nulo implica regla general para la materia
    umbral_pct = Column(Float, default=60.0, nullable=False)
    valores_aprobatorios = Column(JSONB, default=list, nullable=False) # Ej: ["Satisfactorio", "Aprobado"]

class Calificacion(Base, TenantMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'calificacion'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entrada_padron_id = Column(UUID(as_uuid=True), ForeignKey('entrada_padron.id'), index=True, nullable=False)
    actividad_nombre = Column(String(255), nullable=False)
    nota_numerica = Column(Float, nullable=True)
    nota_textual = Column(String(255), nullable=True)
    aprobado = Column(Boolean, nullable=False, default=False)
    origen = Column(String(50), nullable=False) # Ej: 'IMPORTADO_CSV', 'REPORTE_FINALIZACION'
