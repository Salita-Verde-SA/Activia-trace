from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, timezone

from models.tareas import Tarea, ComentarioTarea, EstadoTarea
from models.user import Usuario
from schemas.tarea import TareaCreate, TareaResponse, TareaUpdateEstado, ComentarioTareaCreate, ComentarioTareaResponse

class TareaService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def crear_tarea(self, asignado_por: UUID, asignado_por_roles: List[str], data: TareaCreate) -> TareaResponse:
        from models.rbac import Rol, UsuarioRol
        from models.asignacion import Asignacion

        # Verificar que el usuario asignado existe en el tenant
        usr_query = select(Usuario).where(Usuario.id == data.asignado_a, Usuario.tenant_id == self.tenant_id)
        if not (await self.db.execute(usr_query)).scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario asignado no encontrado")

        if "PROFESOR" in asignado_por_roles and "ADMIN" not in asignado_por_roles and "COORDINADOR" not in asignado_por_roles:
            query_roles_target = select(Rol.nombre).join(UsuarioRol).where(UsuarioRol.usuario_id == data.asignado_a, UsuarioRol.tenant_id == self.tenant_id)
            target_roles = list((await self.db.execute(query_roles_target)).scalars().all())
            query_asig_roles = select(Rol.nombre).join(Asignacion).where(Asignacion.usuario_id == data.asignado_a, Asignacion.tenant_id == self.tenant_id)
            target_roles.extend((await self.db.execute(query_asig_roles)).scalars().all())

            if "TUTOR" not in target_roles:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Los profesores solo pueden asignar tareas a tutores")

        tarea = Tarea(
            tenant_id=self.tenant_id,
            titulo=data.titulo,
            descripcion=data.descripcion,
            prioridad=data.prioridad,
            asignado_a=data.asignado_a,
            asignado_por=asignado_por,
            contexto_id=data.contexto_id
        )
        self.db.add(tarea)
        await self.db.commit()
        await self.db.refresh(tarea)
        
        # Reload with comments (empty initially)
        t_query = select(Tarea).options(selectinload(Tarea.comentarios)).where(Tarea.id == tarea.id)
        tarea = (await self.db.execute(t_query)).scalar_one()

        # Notificar al asignado
        try:
            from services.comunicaciones import ComunicacionService
            from schemas.comunicacion import LoteCreate, ComunicacionCreate
            
            asignado_obj = (await self.db.execute(select(Usuario).where(Usuario.id == data.asignado_a))).scalar_one_or_none()
            if asignado_obj:
                lote = LoteCreate(comunicaciones=[
                    ComunicacionCreate(
                        destinatario=asignado_obj.email,
                        asunto=f"Nueva tarea asignada: {tarea.titulo}",
                        cuerpo=f"Se le ha asignado la tarea: {tarea.titulo}.\nPrioridad: {tarea.prioridad}"
                    )
                ])
                await ComunicacionService.encolar_lote(self.db, self.tenant_id, lote)
        except Exception as e:
            # Si falla la notificacion no queremos romper la creacion de la tarea
            import logging
            logging.error(f"Fallo al notificar la creacion de tarea: {e}")

        return TareaResponse.model_validate(tarea, from_attributes=True)

    async def listar_mis_tareas(self, usuario_id: UUID) -> List[TareaResponse]:
        query = select(Tarea).options(selectinload(Tarea.comentarios)).where(
            Tarea.asignado_a == usuario_id,
            Tarea.tenant_id == self.tenant_id
        ).order_by(Tarea.fecha_actualizacion.desc())
        
        tareas = (await self.db.execute(query)).scalars().all()
        return [TareaResponse.model_validate(t, from_attributes=True) for t in tareas]

    async def listar_usuarios_asignables(self, current_user_roles: List[str]) -> list:
        from models.rbac import Rol, UsuarioRol
        from models.asignacion import Asignacion
        from schemas.usuario import UsuarioResponse

        query = select(Usuario).where(
            Usuario.tenant_id == self.tenant_id,
            Usuario.deleted_at.is_(None),
            Usuario.activo == True
        )

        if "PROFESOR" in current_user_roles and "ADMIN" not in current_user_roles and "COORDINADOR" not in current_user_roles:
            query = query.outerjoin(UsuarioRol, Usuario.id == UsuarioRol.usuario_id) \
                         .outerjoin(Asignacion, Usuario.id == Asignacion.usuario_id) \
                         .join(Rol, (Rol.id == UsuarioRol.rol_id) | (Rol.id == Asignacion.rol_id)) \
                         .where(Rol.nombre == "TUTOR") \
                         .distinct()

        usuarios = (await self.db.execute(query)).scalars().all()
        return [UsuarioResponse.model_validate(u, from_attributes=True) for u in usuarios]

    async def listar_globales(self, asignado_a: Optional[UUID] = None, estado: Optional[EstadoTarea] = None, asignado_por: Optional[UUID] = None) -> List[TareaResponse]:
        query = select(Tarea).options(selectinload(Tarea.comentarios)).where(
            Tarea.tenant_id == self.tenant_id
        ).order_by(Tarea.fecha_actualizacion.desc())
        
        if asignado_a:
            query = query.where(Tarea.asignado_a == asignado_a)
        if asignado_por:
            query = query.where(Tarea.asignado_por == asignado_por)
        if estado:
            query = query.where(Tarea.estado == estado)
            
        tareas = (await self.db.execute(query)).scalars().all()
        return [TareaResponse.model_validate(t, from_attributes=True) for t in tareas]

    async def cambiar_estado(self, usuario_id: UUID, tarea_id: UUID, data: TareaUpdateEstado) -> TareaResponse:
        query = select(Tarea).options(selectinload(Tarea.comentarios)).where(
            Tarea.id == tarea_id,
            Tarea.tenant_id == self.tenant_id
        )
        tarea = (await self.db.execute(query)).scalar_one_or_none()
        if not tarea:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")

        # Solo el asignado o alguien con admin (chequeado en el router si aplica) puede cambiarla
        # Asumiremos que el control fino de permisos está en el router
        
        tarea.estado = data.estado
        
        if data.comentario:
            comentario = ComentarioTarea(
                tenant_id=self.tenant_id,
                tarea_id=tarea.id,
                usuario_id=usuario_id,
                texto=data.comentario
            )
            self.db.add(comentario)
            
        await self.db.commit()
        await self.db.refresh(tarea)
        
        # Reload to get updated comments
        tarea = (await self.db.execute(query)).scalar_one()
        return TareaResponse.model_validate(tarea, from_attributes=True)

    async def agregar_comentario(self, usuario_id: UUID, tarea_id: UUID, data: ComentarioTareaCreate) -> ComentarioTareaResponse:
        query = select(Tarea).where(
            Tarea.id == tarea_id,
            Tarea.tenant_id == self.tenant_id
        )
        tarea = (await self.db.execute(query)).scalar_one_or_none()
        if not tarea:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
            
        comentario = ComentarioTarea(
            tenant_id=self.tenant_id,
            tarea_id=tarea.id,
            usuario_id=usuario_id,
            texto=data.texto
        )
        self.db.add(comentario)
        
        # Touch tarea's updated_at
        tarea.fecha_actualizacion = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(comentario)
        
        return ComentarioTareaResponse.model_validate(comentario, from_attributes=True)

    async def listar_comentarios(self, tarea_id: UUID) -> List[ComentarioTareaResponse]:
        query = select(ComentarioTarea).where(
            ComentarioTarea.tarea_id == tarea_id,
            ComentarioTarea.tenant_id == self.tenant_id
        ).order_by(ComentarioTarea.fecha_hora.asc())
        
        comentarios = (await self.db.execute(query)).scalars().all()
        return [ComentarioTareaResponse.model_validate(c, from_attributes=True) for c in comentarios]
