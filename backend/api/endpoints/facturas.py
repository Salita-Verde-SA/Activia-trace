from fastapi import APIRouter, Depends, status, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db, require_permission
from models.user import Usuario
from schemas.factura import FacturaCreate, FacturaResponse
from services.facturas import FacturaService

router = APIRouter()

@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_factura(
    data: FacturaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:gestionar"))
):
    service = FacturaService(db, current_user.tenant_id)
    return await service.registrar_factura(data)

@router.get("/", response_model=List[FacturaResponse])
async def listar_facturas(
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("liquidaciones:leer"))
):
    service = FacturaService(db, current_user.tenant_id)
    return await service.listar_facturas(mes, anio)
