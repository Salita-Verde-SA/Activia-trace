import asyncio
import logging
from workers.comunicaciones import comunicaciones_worker_loop

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Worker started. Listening for jobs...")
    # Ejecutamos el worker loop de comunicaciones
    # Si hubiera otros workers, se podrian correr con asyncio.gather
    await comunicaciones_worker_loop()

if __name__ == "__main__":
    asyncio.run(main())
