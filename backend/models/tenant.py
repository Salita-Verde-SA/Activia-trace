import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from models.mixins import TimestampMixin, SoftDeleteMixin

class Tenant(TimestampMixin, SoftDeleteMixin, Base):
    """Entidad raíz del sistema."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(nullable=False)
