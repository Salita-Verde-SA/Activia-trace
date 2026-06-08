from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from uuid import UUID

from core.dependencies import get_db
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("comunicacion:escribir"))
) -> Any:
    """
    Encola un lote de comunicaciones en estado Pendiente.
    """
    lote_id = await ComunicacionService.encolar_lote(db, actor.tenant_id, lote_data)
    return lote_id

@router.get("/lotes/{lote_id}/preview", response_model=List[ComunicacionResponse])
async def previsualizar_lote(
    lote_id: UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("comunicacion:leer"))
) -> Any:
    """
    Previsualiza los mensajes pendientes de un lote (desencriptando el destinatario).
    """
    comunicaciones = await ComunicacionService.obtener_pendientes_por_lote(db, actor.tenant_id, lote_id)
    if not comunicaciones:
        raise HTTPException(status_code=404, detail="Lote no encontrado o sin mensajes pendientes")
        
    return [
        ComunicacionResponse(
            id=c.id,
            lote_id=c.lote_id,
            destinatario=c.destinatario_cifrado, 
            asunto=c.asunto,
            cuerpo=c.cuerpo,
            estado=c.estado,
            fecha_envio=c.fecha_envio,
            error_msg=c.error_msg
        ) for c in comunicaciones
    ]

@router.post("/lotes/{lote_id}/aprobar")
async def aprobar_lote(
    lote_id: UUID,
    db: AsyncSession = Depends(get_db),
    actor: Usuario = Depends(require_permission("comunicacion:aprobar"))
) -> Any:
    """
    Aprueba un lote de comunicaciones para que el worker las procese.
    Genera un evento de auditoría.
    """
    rowcount = await ComunicacionService.aprobar_lote(db, actor.tenant_id, lote_id, actor.id)
    if rowcount == 0:
        raise HTTPException(status_code=404, detail="Lote no encontrado o ya aprobado/procesado")
        
    await AuditService.log_action(
        db=db,
        tenant_id=actor.tenant_id,
        actor_id=actor.id,
        action="COMUNICACION_ENVIAR", 
        target_resource="LoteComunicacion",
        target_id=lote_id,
        details={"lote_id": str(lote_id), "count": rowcount}
    )
    return {"status": "ok", "aprobadas": rowcount}
