from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from datetime import datetime, timezone

from models.liquidaciones import Factura
from schemas.factura import FacturaCreate, FacturaResponse

class FacturaService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def registrar_factura(self, data: FacturaCreate) -> FacturaResponse:
        # Verificar si ya existe una factura para ese usuario y período
        query = select(Factura).where(
            Factura.tenant_id == self.tenant_id,
            Factura.usuario_id == data.usuario_id,
            Factura.periodo_mes == data.periodo_mes,
            Factura.periodo_anio == data.periodo_anio
        )
        factura_existente = (await self.db.execute(query)).scalar_one_or_none()
        
        if factura_existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una factura para este usuario en el período seleccionado")

        factura = Factura(
            tenant_id=self.tenant_id,
            usuario_id=data.usuario_id,
            periodo_mes=data.periodo_mes,
            periodo_anio=data.periodo_anio,
            monto=data.monto,
            detalle=data.detalle,
            comprobante_url=data.comprobante_url
        )
        self.db.add(factura)
        await self.db.commit()
        await self.db.refresh(factura)
        
        return FacturaResponse.model_validate(factura, from_attributes=True)

    async def listar_facturas(self, mes: int, anio: int) -> List[FacturaResponse]:
        query = select(Factura).where(
            Factura.tenant_id == self.tenant_id,
            Factura.periodo_mes == mes,
            Factura.periodo_anio == anio
        )
        facturas = (await self.db.execute(query)).scalars().all()
        return [FacturaResponse.model_validate(f, from_attributes=True) for f in facturas]
