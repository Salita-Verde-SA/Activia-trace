import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from repositories.asignacion import AsignacionRepository
from models.asignacion import Asignacion
from models.audit import AuditLog
from schemas.asignacion import (
    AsignacionCreate, AsignacionUpdate, AsignacionMasivaCreate,
    ClonadoEquipoRequest, AsignacionVigenciaUpdate, EquipoDocenteView
)
from fastapi import HTTPException

class AsignacionService:
    def __init__(self, db: AsyncSession, tenant_id: str):
        self.db = db
        self.tenant_id = uuid.UUID(tenant_id)
        self.asignacion_repo = AsignacionRepository(db, self.tenant_id)

    async def get_asignacion(self, asignacion_id: uuid.UUID) -> Asignacion | None:
        return await self.asignacion_repo.get(asignacion_id)

    async def get_asignaciones_by_usuario(self, usuario_id: uuid.UUID) -> list[Asignacion]:
        stmt = select(Asignacion).where(
            Asignacion.tenant_id == self.tenant_id,
            Asignacion.usuario_id == usuario_id,
            Asignacion.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_asignacion(self, data: AsignacionCreate) -> Asignacion:
        asignacion = Asignacion(
            tenant_id=self.tenant_id,
            usuario_id=data.usuario_id,
            rol_id=data.rol_id,
            materia_id=data.materia_id,
            carrera_id=data.carrera_id,
            cohorte_id=data.cohorte_id,
            responsable_id=data.responsable_id,
            desde=data.desde,
            hasta=data.hasta
        )
        return await self.asignacion_repo.create(asignacion)

    async def update_asignacion(self, asignacion_id: uuid.UUID, data: AsignacionUpdate) -> Asignacion:
        asignacion = await self.asignacion_repo.get(asignacion_id)
        if not asignacion:
            raise HTTPException(status_code=404, detail="Asignación no encontrada")

        update_data = data.model_dump(exclude_unset=True)
        return await self.asignacion_repo.update(asignacion_id, update_data)

    async def delete_asignacion(self, asignacion_id: uuid.UUID) -> None:
        asignacion = await self.asignacion_repo.get(asignacion_id)
        if not asignacion:
            raise HTTPException(status_code=404, detail="Asignación no encontrada")
        await self.asignacion_repo.delete(asignacion_id)

    async def asignar_bloque(self, data: AsignacionMasivaCreate, actor_id: uuid.UUID) -> list[Asignacion]:
        asignaciones = []
        for doc in data.docentes:
            asig = Asignacion(
                tenant_id=self.tenant_id,
                usuario_id=doc.usuario_id,
                rol_id=doc.rol_id,
                materia_id=data.materia_id,
                carrera_id=data.carrera_id,
                cohorte_id=data.cohorte_id,
                responsable_id=doc.responsable_id,
                desde=data.desde,
                hasta=data.hasta
            )
            self.db.add(asig)
            asignaciones.append(asig)
            
        audit = AuditLog(
            tenant_id=self.tenant_id,
            actor_id=actor_id,
            accion='ASIGNACION_MODIFICAR',
            detalle={'tipo': 'masiva', 'cantidad': len(asignaciones)},
            filas_afectadas=len(asignaciones)
        )
        self.db.add(audit)
        await self.db.commit()
        
        # Refrescar para retornar con IDs
        for a in asignaciones:
            await self.db.refresh(a)
        return asignaciones

    async def clonar_equipo(self, data: ClonadoEquipoRequest, actor_id: uuid.UUID) -> list[Asignacion]:
        # Buscar asignaciones de la cohorte_id_origen
        stmt = select(Asignacion).where(
            Asignacion.tenant_id == self.tenant_id,
            Asignacion.cohorte_id == data.cohorte_id_origen,
            Asignacion.deleted_at.is_(None)
        )
        if data.materia_id:
            stmt = stmt.where(Asignacion.materia_id == data.materia_id)
        if data.carrera_id:
            stmt = stmt.where(Asignacion.carrera_id == data.carrera_id)
            
        result = await self.db.execute(stmt)
        origen = list(result.scalars().all())
        
        if not origen:
            raise HTTPException(status_code=404, detail="No se encontraron asignaciones en el origen")
            
        asignaciones = []
        for asig in origen:
            nueva_asig = Asignacion(
                tenant_id=self.tenant_id,
                usuario_id=asig.usuario_id,
                rol_id=asig.rol_id,
                materia_id=asig.materia_id,
                carrera_id=asig.carrera_id,
                cohorte_id=data.cohorte_id_destino,
                responsable_id=asig.responsable_id,
                desde=data.nuevo_desde,
                hasta=data.nuevo_hasta
            )
            self.db.add(nueva_asig)
            asignaciones.append(nueva_asig)
            
        audit = AuditLog(
            tenant_id=self.tenant_id,
            actor_id=actor_id,
            accion='ASIGNACION_MODIFICAR',
            detalle={'tipo': 'clonado', 'origen': str(data.cohorte_id_origen), 'destino': str(data.cohorte_id_destino)},
            filas_afectadas=len(asignaciones)
        )
        self.db.add(audit)
        await self.db.commit()
        
        for a in asignaciones:
            await self.db.refresh(a)
        return asignaciones

    async def modificar_vigencia_equipo(self, data: AsignacionVigenciaUpdate, actor_id: uuid.UUID) -> list[Asignacion]:
        if not data.asignacion_ids:
            return []
            
        stmt = select(Asignacion).where(
            Asignacion.tenant_id == self.tenant_id,
            Asignacion.id.in_(data.asignacion_ids),
            Asignacion.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        asignaciones = list(result.scalars().all())
        
        for asig in asignaciones:
            if data.nuevo_desde is not None:
                asig.desde = data.nuevo_desde
            if data.nuevo_hasta is not None:
                asig.hasta = data.nuevo_hasta
                
        if asignaciones:
            audit = AuditLog(
                tenant_id=self.tenant_id,
                actor_id=actor_id,
                accion='ASIGNACION_MODIFICAR',
                detalle={'tipo': 'modificar_vigencia'},
                filas_afectadas=len(asignaciones)
            )
            self.db.add(audit)
            await self.db.commit()
            
            for a in asignaciones:
                await self.db.refresh(a)
                
        return asignaciones
