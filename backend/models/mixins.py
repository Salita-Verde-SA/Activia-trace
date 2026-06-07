import uuid
from datetime import datetime, UTC
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

def utc_now() -> datetime:
    return datetime.now(UTC)

class TimestampMixin:
    """Añade created_at y updated_at a los modelos."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class SoftDeleteMixin:
    """Añade soporte para soft delete marcando deleted_at."""
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

class TenantMixin:
    """Añade la vinculación obligatoria a un Tenant."""
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False, index=True
    )
