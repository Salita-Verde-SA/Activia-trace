import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from models.mixins import TimestampMixin

class RecoveryToken(Base, TimestampMixin):
    __tablename__ = "recovery_token"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    token = Column(String, nullable=False, unique=True, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
