from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.logging import setup_logging
from core.observability import setup_observability
from core.database import engine
from api.v1.routers import health
import asyncio
from workers.comunicaciones import comunicaciones_worker_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    setup_observability(app)
    # Iniciar workers
    worker_task = asyncio.create_task(comunicaciones_worker_loop())
    yield
    # Shutdown
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    await engine.dispose()

app = FastAPI(title="Activia Trace", lifespan=lifespan)

app.include_router(health.router)

from api.routers import auth
from api.routers.admin import carreras, cohortes, materias

app.include_router(auth.router)
app.include_router(carreras.router, prefix="/api/admin")
app.include_router(cohortes.router, prefix="/api/admin")
app.include_router(materias.router, prefix="/api/admin")

from api.endpoints import usuarios, asignaciones, equipos, padron, calificaciones, analisis, comunicaciones, encuentros, guardias, evaluaciones, avisos, tareas, liquidaciones, facturas, salarios, auditoria, perfil, mensajeria_interna
app.include_router(usuarios.router, prefix="/api")
app.include_router(asignaciones.router, prefix="/api")
app.include_router(equipos.router, prefix="/api")
app.include_router(padron.router, prefix="/api")
app.include_router(calificaciones.router, prefix="/api")
app.include_router(analisis.router, prefix="/api")
app.include_router(comunicaciones.router, prefix="/api")
app.include_router(encuentros.router, prefix="/api", tags=["encuentros"])
app.include_router(guardias.router, prefix="/api", tags=["guardias"])
app.include_router(evaluaciones.router, prefix="/api/evaluaciones", tags=["evaluaciones"])
app.include_router(avisos.router, prefix="/api/avisos", tags=["avisos"])
app.include_router(tareas.router, prefix="/api/tareas", tags=["tareas"])
app.include_router(liquidaciones.router, prefix="/api/liquidaciones", tags=["liquidaciones"])
app.include_router(facturas.router, prefix="/api/facturas", tags=["facturas"])
app.include_router(salarios.router, prefix="/api/salarios", tags=["salarios"])
app.include_router(auditoria.router, prefix="/api/auditoria", tags=["auditoria"])
app.include_router(perfil.router, prefix="/api/perfil", tags=["perfil"])
app.include_router(mensajeria_interna.router, prefix="/api/mensajes/internos", tags=["mensajeria_interna"])
