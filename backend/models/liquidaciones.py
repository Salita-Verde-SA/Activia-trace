from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Integer, Date
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
import enum
import uuid
from models.base import Base
from models.mixins import TimestampMixin, SoftDeleteMixin

class RolUsuario(str, enum.Enum):
    ALUMNO = "ALUMNO"
    TUTOR = "TUTOR"
    PROFESOR = "PROFESOR"
    COORDINADOR = "COORDINADOR"
    NEXO = "NEXO"
    ADMIN = "ADMIN"
    FINANZAS = "FINANZAS"
class EstadoLiquidacion(str, enum.Enum):
    ABIERTA = "Abierta"
    CERRADA = "Cerrada"

class SalarioBase(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "salarios_base"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True)
    rol = Column(SQLEnum(RolUsuario, name="rol_usuario_enum", create_type=False), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date, nullable=True)

class SalarioPlus(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "salarios_plus"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True)
    clave_plus = Column(String(50), nullable=False)
    rol = Column(SQLEnum(RolUsuario, name="rol_usuario_enum", create_type=False), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date, nullable=True)

class Factura(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "facturas"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True)
    usuario_id = Column(PGUUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    periodo_mes = Column(Integer, nullable=False)
    periodo_anio = Column(Integer, nullable=False)
    monto = Column(Float, nullable=False)
    detalle = Column(String, nullable=True)
    comprobante_url = Column(String, nullable=True)

class Liquidacion(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "liquidaciones"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True)
    usuario_id = Column(PGUUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    periodo_mes = Column(Integer, nullable=False)
    periodo_anio = Column(Integer, nullable=False)
    monto_base = Column(Float, nullable=False)
    monto_plus = Column(Float, nullable=False)
    monto_total = Column(Float, nullable=False)
    es_nexo = Column(Boolean, nullable=False, default=False)
    excluido_por_factura = Column(Boolean, nullable=False, default=False)
    estado = Column(SQLEnum(EstadoLiquidacion, name="estado_liquidacion_enum", create_type=False), nullable=False)
    detalle_calculo = Column(JSONB, nullable=True) # Snapshot del cálculo cuando se cierra
