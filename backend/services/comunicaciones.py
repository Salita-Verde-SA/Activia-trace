from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID, uuid4
from typing import List

from models.comunicacion import Comunicacion, EstadoComunicacion
from schemas.comunicacion import LoteCreate

class ComunicacionService:
    @staticmethod
    async def encolar_lote(db: AsyncSession, tenant_id: UUID, lote_data: LoteCreate) -> UUID:
        lote_id = uuid4()
        comunicaciones = []
        for comm in lote_data.comunicaciones:
            comunicacion = Comunicacion(
                tenant_id=tenant_id,
                lote_id=lote_id,
                destinatario_cifrado=comm.destinatario,
                asunto=comm.asunto,
                cuerpo=comm.cuerpo,
                estado=EstadoComunicacion.PENDIENTE,
                aprobado=False
            )
            comunicaciones.append(comunicacion)
            
        db.add_all(comunicaciones)
        await db.commit()
        return lote_id

    @staticmethod
    async def obtener_pendientes_por_lote(db: AsyncSession, tenant_id: UUID, lote_id: UUID) -> List[Comunicacion]:
        stmt = select(Comunicacion).where(
            Comunicacion.tenant_id == tenant_id,
            Comunicacion.lote_id == lote_id,
            Comunicacion.estado == EstadoComunicacion.PENDIENTE
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def aprobar_lote(db: AsyncSession, tenant_id: UUID, lote_id: UUID, actor_id: UUID) -> int:
        stmt = update(Comunicacion).where(
            Comunicacion.tenant_id == tenant_id,
            Comunicacion.lote_id == lote_id,
            Comunicacion.estado == EstadoComunicacion.PENDIENTE,
            Comunicacion.aprobado == False
        ).values(
            aprobado=True
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount
