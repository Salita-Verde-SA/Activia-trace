from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
from fastapi import HTTPException, status
from datetime import datetime, timezone

from models.avisos import Aviso, AcknowledgmentAviso, AlcanceAviso
from models.asignacion import Asignacion
from models.user import Usuario
from schemas.aviso import AvisoCreate, AvisoResponse, AvisoAcknowledgmentCreate, AvisoMetrics

class AvisoService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def crear_aviso(self, data: AvisoCreate, actor_id: UUID) -> AvisoResponse:
        aviso = Aviso(
            tenant_id=self.tenant_id,
            titulo=data.titulo,
            cuerpo=data.cuerpo,
            severidad=data.severidad,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            requiere_ack=data.requiere_ack,
            alcance=data.alcance,
            materia_id=data.materia_id,
            cohorte_id=data.cohorte_id,
            rol_id=data.rol_id
        )
        self.db.add(aviso)
        
        from models.audit import AuditLog
        
        audit = AuditLog(
            tenant_id=self.tenant_id,
            actor_id=actor_id,
            accion="PUBLICAR_AVISO",
            materia_id=data.materia_id,
            detalle={"cohorte_id": str(data.cohorte_id) if data.cohorte_id else None, "rol_id": str(data.rol_id) if data.rol_id else None, "aviso_id": "pending"},
            filas_afectadas=1
        )
        self.db.add(audit)
        
        await self.db.commit()
        await self.db.refresh(aviso)
        
        # Actualizar detalle con el aviso_id real si es necesario o dejarlo así.
        audit.detalle["aviso_id"] = str(aviso.id)
        self.db.add(audit)
        await self.db.commit()
        
        return AvisoResponse.model_validate(aviso, from_attributes=True)

    async def listar_activos_para_usuario(self, usuario_id: UUID) -> List[AvisoResponse]:
        now = datetime.now(timezone.utc)
        
        # 1. Obtener todas las asignaciones del usuario
        asig_query = select(Asignacion).where(
            Asignacion.usuario_id == usuario_id,
            Asignacion.tenant_id == self.tenant_id,
            Asignacion.desde <= now,
            or_(Asignacion.hasta == None, Asignacion.hasta >= now),
            Asignacion.deleted_at == None
        )
        asignaciones = (await self.db.execute(asig_query)).scalars().all()
        
        materias_ids = [a.materia_id for a in asignaciones if a.materia_id]
        cohortes_ids = [a.cohorte_id for a in asignaciones if a.cohorte_id]
        roles_ids = [a.rol_id for a in asignaciones if a.rol_id]

        # 2. Consultar avisos activos que matchean el alcance
        alcance_conds = [Aviso.alcance == AlcanceAviso.GLOBAL]
        if materias_ids:
            alcance_conds.append(and_(Aviso.alcance == AlcanceAviso.MATERIA, Aviso.materia_id.in_(materias_ids)))
        if cohortes_ids:
            alcance_conds.append(and_(Aviso.alcance == AlcanceAviso.COHORTE, Aviso.cohorte_id.in_(cohortes_ids)))
        if roles_ids:
            alcance_conds.append(and_(Aviso.alcance == AlcanceAviso.ROL, Aviso.rol_id.in_(roles_ids)))

        avisos_query = select(Aviso).where(
            Aviso.tenant_id == self.tenant_id,
            Aviso.fecha_inicio <= now,
            or_(Aviso.fecha_fin == None, Aviso.fecha_fin >= now),
            or_(*alcance_conds)
        )
        avisos = (await self.db.execute(avisos_query)).scalars().all()

        # 3. Filtrar los que ya tienen ack
        avisos_pendientes = []
        for aviso in avisos:
            if aviso.requiere_ack:
                ack_query = select(AcknowledgmentAviso).where(
                    AcknowledgmentAviso.aviso_id == aviso.id,
                    AcknowledgmentAviso.usuario_id == usuario_id,
                    AcknowledgmentAviso.tenant_id == self.tenant_id
                )
                ack_exists = (await self.db.execute(ack_query)).scalar_one_or_none()
                if not ack_exists:
                    avisos_pendientes.append(aviso)
            else:
                avisos_pendientes.append(aviso)

        return [AvisoResponse.model_validate(a, from_attributes=True) for a in avisos_pendientes]

    async def listar_todos(self) -> List[AvisoResponse]:
        avisos_query = select(Aviso).where(Aviso.tenant_id == self.tenant_id).order_by(Aviso.fecha_inicio.desc())
        avisos = (await self.db.execute(avisos_query)).scalars().all()
        return [AvisoResponse.model_validate(a, from_attributes=True) for a in avisos]

    async def registrar_acuse_recibo(self, usuario_id: UUID, data: AvisoAcknowledgmentCreate) -> dict:
        aviso_query = select(Aviso).where(
            Aviso.id == data.aviso_id,
            Aviso.tenant_id == self.tenant_id
        )
        aviso = (await self.db.execute(aviso_query)).scalar_one_or_none()
        
        if not aviso:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aviso no encontrado")
        
        if not aviso.requiere_ack:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El aviso no requiere acuse de recibo")

        # Check existing ack
        ack_query = select(AcknowledgmentAviso).where(
            AcknowledgmentAviso.aviso_id == data.aviso_id,
            AcknowledgmentAviso.usuario_id == usuario_id,
            AcknowledgmentAviso.tenant_id == self.tenant_id
        )
        if (await self.db.execute(ack_query)).scalar_one_or_none():
            return {"status": "ok", "message": "Ack ya registrado"}

        nuevo_ack = AcknowledgmentAviso(
            tenant_id=self.tenant_id,
            aviso_id=data.aviso_id,
            usuario_id=usuario_id
        )
        self.db.add(nuevo_ack)
        await self.db.commit()

        return {"status": "ok", "message": "Ack registrado exitosamente"}

    async def obtener_metricas_aviso(self, aviso_id: UUID) -> AvisoMetrics:
        aviso_query = select(Aviso).where(
            Aviso.id == aviso_id,
            Aviso.tenant_id == self.tenant_id
        )
        aviso = (await self.db.execute(aviso_query)).scalar_one_or_none()
        
        if not aviso:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aviso no encontrado")

        now = datetime.now(timezone.utc)
        alcance_total = 0

        if aviso.alcance == AlcanceAviso.GLOBAL:
            # Usuarios activos en el tenant
            usr_query = select(func.count(Usuario.id)).where(Usuario.tenant_id == self.tenant_id, Usuario.deleted_at == None)
            alcance_total = (await self.db.execute(usr_query)).scalar() or 0
        else:
            asig_conds = [
                Asignacion.tenant_id == self.tenant_id,
                Asignacion.deleted_at == None,
                Asignacion.desde <= now,
                or_(Asignacion.hasta == None, Asignacion.hasta >= now)
            ]
            if aviso.alcance == AlcanceAviso.MATERIA and aviso.materia_id:
                asig_conds.append(Asignacion.materia_id == aviso.materia_id)
            elif aviso.alcance == AlcanceAviso.COHORTE and aviso.cohorte_id:
                asig_conds.append(Asignacion.cohorte_id == aviso.cohorte_id)
            elif aviso.alcance == AlcanceAviso.ROL and aviso.rol_id:
                asig_conds.append(Asignacion.rol_id == aviso.rol_id)
            
            # Count unique users with such assignments
            asig_query = select(func.count(func.distinct(Asignacion.usuario_id))).where(and_(*asig_conds))
            alcance_total = (await self.db.execute(asig_query)).scalar() or 0

        # Count Acks
        ack_query = select(func.count(AcknowledgmentAviso.id)).where(
            AcknowledgmentAviso.aviso_id == aviso_id,
            AcknowledgmentAviso.tenant_id == self.tenant_id
        )
        leidos_count = (await self.db.execute(ack_query)).scalar() or 0

        pendientes_count = alcance_total - leidos_count
        if pendientes_count < 0:
            pendientes_count = 0
            
        porcentaje_leidos = 0.0
        if alcance_total > 0:
            porcentaje_leidos = round((leidos_count / alcance_total) * 100, 2)

        return AvisoMetrics(
            aviso_id=aviso_id,
            alcance_total=alcance_total,
            leidos_count=leidos_count,
            pendientes_count=pendientes_count,
            porcentaje_leidos=porcentaje_leidos
        )
