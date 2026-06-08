from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Integer, Date
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
import enum
from models.base import BaseModel
from models.user import RolUsuario

class EstadoLiquidacion(str, enum.Enum):
    ABIERTA = "Abierta"
    CERRADA = "Cerrada"

class SalarioBase(BaseModel):
    __tablename__ = "salarios_base"

    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    rol = Column(SQLEnum(RolUsuario, name="rol_usuario_enum", create_type=False), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date, nullable=True)

class SalarioPlus(BaseModel):
    __tablename__ = "salarios_plus"

    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    clave_plus = Column(String(50), nullable=False)
    rol = Column(SQLEnum(RolUsuario, name="rol_usuario_enum", create_type=False), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date, nullable=True)

class Factura(BaseModel):
    __tablename__ = "facturas"

    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    usuario_id = Column(PGUUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    periodo_mes = Column(Integer, nullable=False)
    periodo_anio = Column(Integer, nullable=False)
    monto = Column(Float, nullable=False)
    detalle = Column(String, nullable=True)
    comprobante_url = Column(String, nullable=True)

class Liquidacion(BaseModel):
    __tablename__ = "liquidaciones"

    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    usuario_id = Column(PGUUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    periodo_mes = Column(Integer, nullable=False)
    periodo_anio = Column(Integer, nullable=False)
    
    monto_base = Column(Float, nullable=False, default=0.0)
    monto_plus = Column(Float, nullable=False, default=0.0)
    monto_total = Column(Float, nullable=False, default=0.0)
    
    es_nexo = Column(Boolean, nullable=False, default=False)
    excluido_por_factura = Column(Boolean, nullable=False, default=False)
    
    estado = Column(SQLEnum(EstadoLiquidacion, name="estado_liquidacion_enum"), nullable=False, default=EstadoLiquidacion.ABIERTA)
    detalle_calculo = Column(JSONB, nullable=True) # Snapshot del cálculo cuando se cierra
