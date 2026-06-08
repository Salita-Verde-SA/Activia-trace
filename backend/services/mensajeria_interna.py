from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from fastapi import HTTPException
from datetime import datetime

from models.user import Usuario
from models.mensajeria_interna import HiloMensajeInterno, MensajeInterno
from schemas.mensajeria_interna import (
    HiloCreate, MensajeInternoCreate, HiloResponse, 
    MensajeInternoResponse, HiloListResponse
)

class MensajeriaInternoService:
    def __init__(self, db: AsyncSession, tenant_id: UUID, current_user: Usuario):
        self.db = db
        self.tenant_id = tenant_id
        self.current_user = current_user

    async def iniciar_hilo(self, data: HiloCreate) -> HiloResponse:
        # Validar destinatarios
        if self.current_user.id in data.destinatarios_ids:
            # Puedes iniciar un hilo contigo mismo, o evitarlo. Por ahora lo permitimos o filtramos.
            pass
            
        participantes_ids = list(set(data.destinatarios_ids + [self.current_user.id]))
        
        query = select(Usuario).where(
            Usuario.tenant_id == self.tenant_id,
            Usuario.id.in_(participantes_ids)
        )
        participantes = (await self.db.execute(query)).scalars().all()
        
        if len(participantes) != len(participantes_ids):
            raise HTTPException(status_code=400, detail="Algunos destinatarios no son válidos o no existen")

        hilo = HiloMensajeInterno(
            tenant_id=self.tenant_id,
            asunto=data.asunto,
            creado_por_id=self.current_user.id,
            participantes=participantes
        )
        
        mensaje = MensajeInterno(
            tenant_id=self.tenant_id,
            hilo=hilo,
            emisor_id=self.current_user.id,
            contenido=data.mensaje_inicial,
            leido=True # El creador ya lo leyó
        )
        
        self.db.add(hilo)
        self.db.add(mensaje)
        await self.db.commit()
        await self.db.refresh(hilo)
        
        # Volvemos a cargarlo con sus relaciones para la respuesta
        query_hilo = select(HiloMensajeInterno).options(
            selectinload(HiloMensajeInterno.participantes),
            selectinload(HiloMensajeInterno.mensajes)
        ).where(HiloMensajeInterno.id == hilo.id)
        hilo_full = (await self.db.execute(query_hilo)).scalar_one()

        return HiloResponse.model_validate(hilo_full, from_attributes=True)

    async def _get_hilo_si_participa(self, hilo_id: UUID) -> HiloMensajeInterno:
        query = select(HiloMensajeInterno).options(
            selectinload(HiloMensajeInterno.participantes),
            selectinload(HiloMensajeInterno.mensajes)
        ).where(
            HiloMensajeInterno.id == hilo_id,
            HiloMensajeInterno.tenant_id == self.tenant_id
        )
        hilo = (await self.db.execute(query)).scalar_one_or_none()
        
        if not hilo:
            raise HTTPException(status_code=404, detail="Hilo no encontrado")
            
        if self.current_user.id not in [p.id for p in hilo.participantes]:
            raise HTTPException(status_code=403, detail="No tienes acceso a este hilo")
            
        return hilo

    async def responder_hilo(self, hilo_id: UUID, data: MensajeInternoCreate) -> MensajeInternoResponse:
        hilo = await self._get_hilo_si_participa(hilo_id)
        
        mensaje = MensajeInterno(
            tenant_id=self.tenant_id,
            hilo_id=hilo.id,
            emisor_id=self.current_user.id,
            contenido=data.contenido,
            leido=True
        )
        self.db.add(mensaje)
        
        hilo.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(mensaje)
        
        return MensajeInternoResponse.model_validate(mensaje, from_attributes=True)

    async def listar_bandeja_entrada(self, limit: int = 50, offset: int = 0) -> List[HiloListResponse]:
        query = select(HiloMensajeInterno).options(
            selectinload(HiloMensajeInterno.participantes)
        ).filter(
            HiloMensajeInterno.tenant_id == self.tenant_id,
            HiloMensajeInterno.participantes.any(Usuario.id == self.current_user.id)
        ).order_by(HiloMensajeInterno.updated_at.desc()).limit(limit).offset(offset)
        
        hilos = (await self.db.execute(query)).scalars().all()
        
        res = []
        for hilo in hilos:
            # Obtener el último mensaje
            q_ultimo = select(MensajeInterno).where(MensajeInterno.hilo_id == hilo.id).order_by(MensajeInterno.created_at.desc()).limit(1)
            ultimo_msj = (await self.db.execute(q_ultimo)).scalar_one_or_none()
            
            # Contar no leídos para este usuario en este hilo
            # Un mensaje es no leído para el usuario si leido=False y el emisor NO es él
            q_no_leidos = select(func.count()).select_from(MensajeInterno).where(
                MensajeInterno.hilo_id == hilo.id,
                MensajeInterno.leido == False,
                MensajeInterno.emisor_id != self.current_user.id
            )
            no_leidos = (await self.db.execute(q_no_leidos)).scalar_one()
            
            res.append(HiloListResponse(
                id=hilo.id,
                asunto=hilo.asunto,
                created_at=hilo.created_at,
                updated_at=hilo.updated_at,
                ultimo_mensaje=ultimo_msj.contenido if ultimo_msj else None,
                no_leidos_count=no_leidos
            ))
            
        return res

    async def obtener_mensajes_hilo(self, hilo_id: UUID) -> HiloResponse:
        hilo = await self._get_hilo_si_participa(hilo_id)
        
        # Marcar como leídos los que no son de este usuario
        q_marcar = select(MensajeInterno).where(
            MensajeInterno.hilo_id == hilo.id,
            MensajeInterno.leido == False,
            MensajeInterno.emisor_id != self.current_user.id
        )
        mensajes_no_leidos = (await self.db.execute(q_marcar)).scalars().all()
        
        if mensajes_no_leidos:
            for m in mensajes_no_leidos:
                m.leido = True
            await self.db.commit()
            
            # Refrescar hilo para reflejar los cambios
            await self.db.refresh(hilo)

        return HiloResponse.model_validate(hilo, from_attributes=True)

    async def contar_no_leidos_global(self) -> int:
        # Contar mensajes no leídos en hilos donde participa el usuario
        # Optimizando la subquery
        query = select(func.count()).select_from(MensajeInterno).join(
            HiloMensajeInterno, HiloMensajeInterno.id == MensajeInterno.hilo_id
        ).filter(
            MensajeInterno.tenant_id == self.tenant_id,
            MensajeInterno.leido == False,
            MensajeInterno.emisor_id != self.current_user.id,
            HiloMensajeInterno.participantes.any(Usuario.id == self.current_user.id)
        )
        
        total = (await self.db.execute(query)).scalar_one()
        return total
