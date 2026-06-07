from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.logging import setup_logging
from core.observability import setup_observability
from core.database import engine
from api.v1.routers import health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    setup_observability(app)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(title="Activia Trace", lifespan=lifespan)

app.include_router(health.router)

from api.routers import auth
from api.routers.admin import carreras, cohortes, materias

app.include_router(auth.router)
app.include_router(carreras.router, prefix="/api/admin")
app.include_router(cohortes.router, prefix="/api/admin")
app.include_router(materias.router, prefix="/api/admin")

from api.endpoints import usuarios, asignaciones, equipos
app.include_router(usuarios.router, prefix="/api")
app.include_router(asignaciones.router, prefix="/api")
app.include_router(equipos.router, prefix="/api")
