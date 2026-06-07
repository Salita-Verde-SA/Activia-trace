from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from models.base import Base
from models.mixins import TimestampMixin
import uuid
from sqlalchemy.orm import Mapped, mapped_column

class Session(Base, TimestampMixin):
    __tablename__ = "session"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Refresh token string (o hash). Guardamos el token en sí (o su hash) para invalidarlo
    token = Column(String, nullable=False, unique=True, index=True)
    
    # Usuario asociado
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
