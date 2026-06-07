import uuid
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from models.audit import AuditLog
from api.dependencies.auth import CurrentUser

async def log_audit_event(
    db: AsyncSession,
    request: Request,
    current_user: CurrentUser,
    accion: str,
    detalle: dict | None = None,
    filas_afectadas: int = 1,
    materia_id: uuid.UUID | None = None
):
    """
    Registra un evento significativo en el log de auditoría.
    Maneja la extracción de contexto como IP, User-Agent, y resuelve la identidad real vs suplantada.
    """
    # Intentamos sacar la IP real si hay proxies (X-Forwarded-For), si no el host directo
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else None
        
    user_agent = request.headers.get("user-agent")
    
    # Si hay impersonator_id, el verdadero actor es el impersonador, y el target (current_user.id) es el impersonado
    if current_user.impersonator_id:
        actor_id = current_user.impersonator_id
        impersonado_id = current_user.id
    else:
        actor_id = current_user.id
        impersonado_id = None
        
    audit_entry = AuditLog(
        actor_id=actor_id,
        impersonado_id=impersonado_id,
        tenant_id=current_user.tenant_id,
        materia_id=materia_id,
        accion=accion,
        detalle=detalle,
        filas_afectadas=filas_afectadas,
        ip=ip,
        user_agent=user_agent
    )
    
    db.add(audit_entry)
    # No hacemos commit explícito aquí, permitiendo agrupar la auditoría 
    # dentro de la misma transacción de la acción de negocio
