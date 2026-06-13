from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class RolResponse(BaseModel):
    id: UUID
    nombre: str

    class Config:
        from_attributes = True
