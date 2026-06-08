from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from api.dependencies.auth import require_permission
from models.user import Usuario
from schemas.salario import SalarioBaseCreate, SalarioBaseResponse, SalarioPlusCreate, SalarioPlusResponse
from services.salarios import SalarioService

router = APIRouter()

@router.post("/base", response_model=SalarioBaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_salario_base(
    data: SalarioBaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:gestionar"))
):
    service = SalarioService(db, current_user.tenant_id)
    return await service.crear_salario_base(data)

@router.get("/base", response_model=List[SalarioBaseResponse])
async def listar_salarios_base(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:leer"))
):
    service = SalarioService(db, current_user.tenant_id)
    return await service.listar_salarios_base()

@router.post("/plus", response_model=SalarioPlusResponse, status_code=status.HTTP_201_CREATED)
async def crear_salario_plus(
    data: SalarioPlusCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:gestionar"))
):
    service = SalarioService(db, current_user.tenant_id)
    return await service.crear_salario_plus(data)

@router.get("/plus", response_model=List[SalarioPlusResponse])
async def listar_salarios_plus(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:leer"))
):
    service = SalarioService(db, current_user.tenant_id)
    return await service.listar_salarios_plus()
