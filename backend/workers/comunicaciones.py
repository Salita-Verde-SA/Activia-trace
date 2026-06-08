import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import async_session_maker
from models.comunicacion import Comunicacion, EstadoComunicacion
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

async def procesar_comunicaciones_pendientes():
    """
    Busca comunicaciones PENDIENTE que esten aprobadas, las transiciona a ENVIANDO,
    simula el envio, y luego a ENVIADO.
    """
    async with async_session_maker() as db:
        stmt = select(Comunicacion).where(
            Comunicacion.estado == EstadoComunicacion.PENDIENTE,
            Comunicacion.aprobado == True
        ).limit(50) 
        
        # Postgres lock
        # stmt = stmt.with_for_update(skip_locked=True)
        
        result = await db.execute(stmt)
        comunicaciones = list(result.scalars().all())
        
        if not comunicaciones:
            return
            
        for c in comunicaciones:
            c.estado = EstadoComunicacion.ENVIANDO
        await db.commit()
        
        for c in comunicaciones:
            try:
                logger.info(f"Enviando comunicacion {c.id}")
                await asyncio.sleep(0.1) 
                
                c.estado = EstadoComunicacion.ENVIADO
                c.fecha_envio = datetime.now(timezone.utc)
            except Exception as e:
                logger.error(f"Error enviando {c.id}: {str(e)}")
                c.estado = EstadoComunicacion.ERROR
                c.error_msg = str(e)
                
        await db.commit()

async def comunicaciones_worker_loop():
    """
    Loop infinito que corre el worker en background.
    """
    logger.info("Comunicaciones worker started")
    while True:
        try:
            await asyncio.sleep(5)  # Polling interval
            await procesar_comunicaciones_pendientes()
        except asyncio.CancelledError:
            logger.info("Comunicaciones worker cancelled")
            break
        except Exception as e:
            logger.error(f"Error en worker de comunicaciones: {str(e)}")
