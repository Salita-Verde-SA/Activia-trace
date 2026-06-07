import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.sql import func

from models.base import Base
from models.mixins import TenantMixin

class AuditLog(Base, TenantMixin):
    __tablename__ = 'audit_log'

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Custom creation time (append-only, no update time)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    actor_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='RESTRICT'), nullable=False)
    impersonado_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey('usuario.id', ondelete='SET NULL'), nullable=True)
    materia_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True) # Assuming materia table isn't created yet, no strict FK yet or keep it loose. Wait, C-06 creates Estructura. No strict FK for now.
    
    accion: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    detalle: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    filas_afectadas: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    
    ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)

from sqlalchemy import DDL, event

trigger_func_ddl = DDL("""
CREATE OR REPLACE FUNCTION prevent_update_delete_audit()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and deletes are not allowed on the audit_log table';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
""")

trigger_attach_ddl = DDL("""
CREATE TRIGGER trg_prevent_update_delete_audit
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_update_delete_audit();
""")

event.listen(
    AuditLog.__table__,
    'after_create',
    trigger_func_ddl.execute_if(dialect='postgresql')
)

event.listen(
    AuditLog.__table__,
    'after_create',
    trigger_attach_ddl.execute_if(dialect='postgresql')
)
