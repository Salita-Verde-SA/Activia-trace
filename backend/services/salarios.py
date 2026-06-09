from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from datetime import date, timedelta

from models.liquidaciones import SalarioBase, SalarioPlus
from schemas.salario import SalarioBaseCreate, SalarioBaseResponse, SalarioPlusCreate, SalarioPlusResponse

class SalarioService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def crear_salario_base(self, data: SalarioBaseCreate) -> SalarioBaseResponse:
        # Buscar salario base anterior para el mismo rol y cerrarlo si no tiene fecha_hasta o si su fecha_hasta es mayor o igual a la nueva fecha_desde
        query = select(SalarioBase).where(
            SalarioBase.tenant_id == self.tenant_id,
            SalarioBase.rol == data.rol,
            (SalarioBase.fecha_hasta == None) | (SalarioBase.fecha_hasta >= data.fecha_desde)
        ).order_by(SalarioBase.fecha_desde.desc())
        
        salarios_viejos = (await self.db.execute(query)).scalars().all()
        for s_viejo in salarios_viejos:
            if s_viejo.fecha_desde >= data.fecha_desde:
                # Si el viejo empieza después o el mismo día, lo forzamos a terminar el mismo día
                # Idealmente esto es un error de validación, pero por ahora lo cerramos
                s_viejo.fecha_hasta = data.fecha_desde
            else:
                # Cortar el anterior un día antes de que empiece el nuevo
                s_viejo.fecha_hasta = data.fecha_desde - timedelta(days=1)
            
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
        # Buscar salario plus anterior para el mismo rol y clave, y cerrarlo
        query = select(SalarioPlus).where(
            SalarioPlus.tenant_id == self.tenant_id,
            SalarioPlus.rol == data.rol,
            SalarioPlus.clave_plus == data.clave_plus,
            (SalarioPlus.fecha_hasta == None) | (SalarioPlus.fecha_hasta >= data.fecha_desde)
        ).order_by(SalarioPlus.fecha_desde.desc())
        
        salarios_viejos = (await self.db.execute(query)).scalars().all()
        for s_viejo in salarios_viejos:
            if s_viejo.fecha_desde >= data.fecha_desde:
                s_viejo.fecha_hasta = data.fecha_desde
            else:
                s_viejo.fecha_hasta = data.fecha_desde - timedelta(days=1)
                
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

    async def update_salario_base(self, salario_id: UUID, data: SalarioBaseCreate) -> SalarioBaseResponse:
        query = select(SalarioBase).where(
            SalarioBase.id == salario_id,
            SalarioBase.tenant_id == self.tenant_id
        )
        salario = (await self.db.execute(query)).scalar_one_or_none()
        if not salario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salario base no encontrado")
            
        salario.rol = data.rol
        salario.monto = data.monto
        salario.fecha_desde = data.fecha_desde
        salario.fecha_hasta = data.fecha_hasta
        
        await self.db.commit()
        await self.db.refresh(salario)
        return SalarioBaseResponse.model_validate(salario, from_attributes=True)

    async def update_salario_plus(self, salario_id: UUID, data: SalarioPlusCreate) -> SalarioPlusResponse:
        query = select(SalarioPlus).where(
            SalarioPlus.id == salario_id,
            SalarioPlus.tenant_id == self.tenant_id
        )
        salario = (await self.db.execute(query)).scalar_one_or_none()
        if not salario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salario plus no encontrado")
            
        salario.clave_plus = data.clave_plus
        salario.rol = data.rol
        salario.monto = data.monto
        salario.fecha_desde = data.fecha_desde
        salario.fecha_hasta = data.fecha_hasta
        
        await self.db.commit()
        await self.db.refresh(salario)
        return SalarioPlusResponse.model_validate(salario, from_attributes=True)
