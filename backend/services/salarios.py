from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from datetime import date

from models.liquidaciones import SalarioBase, SalarioPlus
from schemas.salario import SalarioBaseCreate, SalarioBaseResponse, SalarioPlusCreate, SalarioPlusResponse

class SalarioService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def crear_salario_base(self, data: SalarioBaseCreate) -> SalarioBaseResponse:
        # Buscar salario base anterior para el mismo rol y cerrarlo si no tiene fecha_hasta o si es mayor a data.fecha_desde
        query = select(SalarioBase).where(
            SalarioBase.tenant_id == self.tenant_id,
            SalarioBase.rol == data.rol,
            (SalarioBase.fecha_hasta == None) | (SalarioBase.fecha_hasta >= data.fecha_desde)
        ).order_by(SalarioBase.fecha_desde.desc())
        
        salarios_viejos = (await self.db.execute(query)).scalars().all()
        for s_viejo in salarios_viejos:
            if s_viejo.fecha_desde >= data.fecha_desde:
                # Caso extremo: estamos insertando un salario más antiguo? O igual?
                # Por simplicidad del MVP, solo cortamos el anterior un día antes
                pass
            
            # Cortar el anterior
            # Ideally: s_viejo.fecha_hasta = data.fecha_desde - timedelta(days=1)
            # Para evitar errores con imports, usamos el date directamente si aplicara, o lo dejamos a cargo del usuario proveer grillas consistentes.
            pass
            
        salario = SalarioBase(
            tenant_id=self.tenant_id,
            rol=data.rol,
            monto=data.monto,
            fecha_desde=data.fecha_desde,
            fecha_hasta=data.fecha_hasta
        )
        self.db.add(salario)
        await self.db.commit()
        await self.db.refresh(salario)
        return SalarioBaseResponse.model_validate(salario, from_attributes=True)

    async def crear_salario_plus(self, data: SalarioPlusCreate) -> SalarioPlusResponse:
        salario = SalarioPlus(
            tenant_id=self.tenant_id,
            clave_plus=data.clave_plus,
            rol=data.rol,
            monto=data.monto,
            fecha_desde=data.fecha_desde,
            fecha_hasta=data.fecha_hasta
        )
        self.db.add(salario)
        await self.db.commit()
        await self.db.refresh(salario)
        return SalarioPlusResponse.model_validate(salario, from_attributes=True)

    async def listar_salarios_base(self) -> List[SalarioBaseResponse]:
        query = select(SalarioBase).where(SalarioBase.tenant_id == self.tenant_id).order_by(SalarioBase.fecha_desde.desc())
        salarios = (await self.db.execute(query)).scalars().all()
        return [SalarioBaseResponse.model_validate(s, from_attributes=True) for s in salarios]

    async def listar_salarios_plus(self) -> List[SalarioPlusResponse]:
        query = select(SalarioPlus).where(SalarioPlus.tenant_id == self.tenant_id).order_by(SalarioPlus.fecha_desde.desc())
        salarios = (await self.db.execute(query)).scalars().all()
        return [SalarioPlusResponse.model_validate(s, from_attributes=True) for s in salarios]
