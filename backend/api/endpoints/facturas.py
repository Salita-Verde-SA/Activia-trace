from fastapi import APIRouter, Depends, status, Query, UploadFile, File, Form
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid

from core.dependencies import get_db
from api.dependencies.auth import require_permission, get_current_user
from models.user import Usuario
from schemas.factura import FacturaCreate, FacturaResponse
from services.facturas import FacturaService

router = APIRouter()

UPLOAD_DIR = "uploads/facturas"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_factura(
    periodo_mes: int = Form(...),
    periodo_anio: int = Form(...),
    monto: float = Form(...),
    detalle: str = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Guardar archivo
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # El usuario_id de la factura es el current_user, porque el docente sube su propia factura
    data = FacturaCreate(
        usuario_id=current_user.id,
        periodo_mes=periodo_mes,
        periodo_anio=periodo_anio,
        monto=monto,
        detalle=detalle,
        comprobante_url=filepath
    )
    
    service = FacturaService(db, current_user.tenant_id)
    return await service.registrar_factura(data)

@router.get("/", response_model=List[FacturaResponse])
async def listar_facturas(
    mes: int = Query(...),
    anio: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Si tiene el rol de FINANZAS o ADMIN, ve todas. Si no, solo las suyas.
    service = FacturaService(db, current_user.tenant_id)
    facturas = await service.listar_facturas(mes, anio)
    if "FINANZAS" not in current_user.roles and "ADMIN" not in current_user.roles:
        facturas = [f for f in facturas if f.usuario_id == current_user.id]
    return facturas

from fastapi.responses import FileResponse
from fastapi import HTTPException
from sqlalchemy.future import select
from models.liquidaciones import Factura

@router.get("/{factura_id}/archivo", response_class=FileResponse)
async def descargar_factura(
    factura_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = select(Factura).where(Factura.id == factura_id, Factura.tenant_id == current_user.tenant_id)
    if "FINANZAS" not in current_user.roles and "ADMIN" not in current_user.roles:
        query = query.where(Factura.usuario_id == current_user.id)
    factura = (await db.execute(query)).scalar_one_or_none()
    
    if not factura or not factura.comprobante_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado")
        
    return FileResponse(factura.comprobante_url, media_type="application/pdf", filename=f"factura_{factura.periodo_anio}_{factura.periodo_mes}.pdf")

from schemas.factura import FacturaResponse

@router.put("/{factura_id}/abonar", response_model=FacturaResponse)
async def marcar_factura_abonada(
    factura_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_permission("finanzas:facturar"))
):
    from models.liquidaciones import EstadoFactura
    query = select(Factura).where(Factura.id == factura_id, Factura.tenant_id == current_user.tenant_id)
    factura = (await db.execute(query)).scalar_one_or_none()
    
    if not factura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
        
    factura.estado = EstadoFactura.ABONADA
    await db.commit()
    await db.refresh(factura)
    return FacturaResponse.model_validate(factura, from_attributes=True)
