from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from models.evaluaciones import Evaluacion, ReservaEvaluacion, TipoEvaluacion, EstadoReserva
from models.estructura import Materia
from schemas.coloquio import ColoquioDisponible, ReservaColoquioRequest, ReservaColoquioResponse
from fastapi import HTTPException, status

class ColoquioService:
    def __init__(self, session: AsyncSession, tenant_id: UUID):
        self.session = session
        self.tenant_id = tenant_id

    async def listar_disponibles(self) -> list[ColoquioDisponible]:
        # Un coloquio disponible es una Evaluacion con tipo=COLOQUIO
        now = datetime.now(timezone.utc)
        
        # Primero contamos cuántas reservas activas hay por evaluación
        subq = (
            select(
                ReservaEvaluacion.evaluacion_id,
                func.count(ReservaEvaluacion.id).label('reservas_activas')
            )
            .where(
                and_(
                    ReservaEvaluacion.tenant_id == self.tenant_id,
                    ReservaEvaluacion.estado == EstadoReserva.ACTIVA
                )
            )
            .group_by(ReservaEvaluacion.evaluacion_id)
            .subquery()
        )

        query = (
            select(Evaluacion, Materia.nombre, func.coalesce(subq.c.reservas_activas, 0).label('ocupados'))
            .join(Materia, Materia.id == Evaluacion.materia_id)
            .outerjoin(subq, subq.c.evaluacion_id == Evaluacion.id)
            .where(
                and_(
                    Evaluacion.tenant_id == self.tenant_id,
                    Evaluacion.tipo == TipoEvaluacion.COLOQUIO
                )
            )
        )
        
        result = await self.session.execute(query)
        rows = result.all()
        
        disponibles = []
        for evaluacion, materia_nombre, ocupados in rows:
            # Simulamos una fecha porque Evaluacion no tiene fecha per se, las reservas la tienen.
            # Asumimos que los coloquios disponibles son abstractos o tomamos el dia de hoy
            cupo_total = evaluacion.dias_disponibles * 10 # dummy logic for cupo_total
            cupo_disponible = cupo_total - ocupados
            
            disponibles.append(ColoquioDisponible(
                id=evaluacion.id,
                materia_id=evaluacion.materia_id,
                materia_nombre=materia_nombre,
                fecha=datetime.now(timezone.utc), # TODO: Add explicit date to Evaluacion
                cupo_total=cupo_total,
                cupo_disponible=max(0, cupo_disponible)
            ))
            
        return disponibles

    async def reservar_coloquio(self, alumno_id: UUID, request: ReservaColoquioRequest) -> ReservaColoquioResponse:
        evaluacion = await self.session.get(Evaluacion, request.coloquio_id)
        if not evaluacion or evaluacion.tenant_id != self.tenant_id or evaluacion.tipo != TipoEvaluacion.COLOQUIO:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coloquio no encontrado")

        # Verificar si ya tiene reserva activa
        query = select(ReservaEvaluacion).where(
            and_(
                ReservaEvaluacion.evaluacion_id == request.coloquio_id,
                ReservaEvaluacion.alumno_id == alumno_id,
                ReservaEvaluacion.estado == EstadoReserva.ACTIVA,
                ReservaEvaluacion.tenant_id == self.tenant_id
            )
        )
        result = await self.session.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya posee una reserva activa para este coloquio")

        reserva = ReservaEvaluacion(
            tenant_id=self.tenant_id,
            evaluacion_id=request.coloquio_id,
            alumno_id=alumno_id,
            fecha_hora=datetime.now(timezone.utc), # Asignamos la fecha_hora requerida por el modelo
            estado=EstadoReserva.ACTIVA
        )
        
        self.session.add(reserva)
        await self.session.commit()
        await self.session.refresh(reserva)
        
        return ReservaColoquioResponse(
            id=reserva.id,
            coloquio_id=reserva.evaluacion_id,
            alumno_id=reserva.alumno_id,
            fecha_reserva=reserva.fecha_hora,
            estado=reserva.estado.value
        )

    async def cancelar_reserva(self, alumno_id: UUID, reserva_id: UUID) -> None:
        reserva = await self.session.get(ReservaEvaluacion, reserva_id)
        if not reserva or reserva.tenant_id != self.tenant_id or reserva.alumno_id != alumno_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
            
        reserva.estado = EstadoReserva.CANCELADA
        await self.session.commit()
