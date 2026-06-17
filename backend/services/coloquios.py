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

    async def importar_padron_candidatos(self, convocatoria_id: UUID, file_content: bytes) -> int:
        from models.coloquios import ConvocatoriaColoquio, CandidatoColoquio
        from models.user import Usuario
        import csv
        import io

        convocatoria = await self.session.get(ConvocatoriaColoquio, convocatoria_id)
        if not convocatoria or convocatoria.tenant_id != self.tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Convocatoria no encontrada")

        content = file_content.decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(content))
        
        emails = []
        for row in reader:
            email = row.get("email") or row.get("Email Address")
            if email:
                emails.append(email)

        if not emails:
            raise HTTPException(status_code=400, detail="El archivo no contiene registros válidos (columna email faltante).")

        # Buscar usuarios
        result = await self.session.execute(
            select(Usuario.id, Usuario.email)
            .where(
                and_(
                    Usuario.tenant_id == self.tenant_id,
                    Usuario.deleted_at.is_(None)
                )
            )
        )
        
        # In-memory mapping as email might be encrypted and difficult to query with in_ directly if not deterministic
        usuario_map = {}
        for row in result:
            if row.email in emails:
                usuario_map[row.email] = row.id

        if not usuario_map:
            raise HTTPException(status_code=400, detail="No se encontraron usuarios coincidentes en el sistema.")

        # Obtener candidatos existentes para no duplicar
        existing_result = await self.session.execute(
            select(CandidatoColoquio.usuario_id)
            .where(
                and_(
                    CandidatoColoquio.tenant_id == self.tenant_id,
                    CandidatoColoquio.convocatoria_id == convocatoria_id,
                    CandidatoColoquio.deleted_at.is_(None)
                )
            )
        )
        existing_ids = {row.usuario_id for row in existing_result}

        nuevos_candidatos = 0
        for email, u_id in usuario_map.items():
            if u_id not in existing_ids:
                candidato = CandidatoColoquio(
                    tenant_id=self.tenant_id,
                    convocatoria_id=convocatoria_id,
                    usuario_id=u_id,
                    habilitado=True
                )
                self.session.add(candidato)
                nuevos_candidatos += 1

        await self.session.commit()
        return nuevos_candidatos

    async def crear_convocatoria(self, data: 'ConvocatoriaColoquioCreate') -> 'ConvocatoriaColoquioResponse':
        from models.coloquios import ConvocatoriaColoquio, TurnoColoquio, EstadoConvocatoria, EstadoTurno
        from schemas.coloquio import ConvocatoriaColoquioResponse

        convocatoria = ConvocatoriaColoquio(
            tenant_id=self.tenant_id,
            materia_id=data.materia_id,
            nombre=data.nombre,
            descripcion=data.descripcion,
            fecha_apertura_reservas=data.fecha_apertura_reservas,
            fecha_cierre_reservas=data.fecha_cierre_reservas,
            estado=EstadoConvocatoria.PUBLICADA
        )
        self.session.add(convocatoria)
        await self.session.flush()

        for turno_data in data.turnos:
            turno = TurnoColoquio(
                tenant_id=self.tenant_id,
                convocatoria_id=convocatoria.id,
                fecha_hora_inicio=turno_data.fecha_hora_inicio,
                fecha_hora_fin=turno_data.fecha_hora_fin,
                cupo_maximo=turno_data.cupo_maximo,
                estado=EstadoTurno.ACTIVO
            )
            self.session.add(turno)

        await self.session.commit()
        await self.session.refresh(convocatoria)

        return ConvocatoriaColoquioResponse(
            id=convocatoria.id,
            materia_id=convocatoria.materia_id,
            nombre=convocatoria.nombre,
            estado=convocatoria.estado.value
        )

    async def listar_disponibles(self, alumno_id: UUID) -> list['ColoquioDisponible']:
        from models.coloquios import ConvocatoriaColoquio, TurnoColoquio, CandidatoColoquio, ReservaColoquio, EstadoTurno, EstadoConvocatoria, EstadoReserva
        from models.estructura import Materia
        from schemas.coloquio import ColoquioDisponible
        
        query = (
            select(TurnoColoquio, ConvocatoriaColoquio, Materia.nombre.label("materia_nombre"), ReservaColoquio.id.label("mi_reserva_id"))
            .join(ConvocatoriaColoquio, ConvocatoriaColoquio.id == TurnoColoquio.convocatoria_id)
            .join(Materia, Materia.id == ConvocatoriaColoquio.materia_id)
            .join(CandidatoColoquio, CandidatoColoquio.convocatoria_id == ConvocatoriaColoquio.id)
            .outerjoin(ReservaColoquio, and_(
                ReservaColoquio.turno_id == TurnoColoquio.id,
                ReservaColoquio.usuario_id == alumno_id,
                ReservaColoquio.estado == EstadoReserva.RESERVADA,
                ReservaColoquio.deleted_at.is_(None)
            ))
            .where(
                and_(
                    TurnoColoquio.tenant_id == self.tenant_id,
                    TurnoColoquio.estado == EstadoTurno.ACTIVO,
                    ConvocatoriaColoquio.estado == EstadoConvocatoria.PUBLICADA,
                    CandidatoColoquio.usuario_id == alumno_id,
                    CandidatoColoquio.habilitado == True,
                    CandidatoColoquio.deleted_at.is_(None)
                )
            )
        )
        
        result = await self.session.execute(query)
        rows = result.all()
        
        disponibles = []
        for turno, convocatoria, materia_nombre, mi_reserva_id in rows:
            cupo_disponible = turno.cupo_maximo - turno.cupos_ocupados
            disponibles.append(ColoquioDisponible(
                turno_id=turno.id,
                convocatoria_id=convocatoria.id,
                materia_id=convocatoria.materia_id,
                materia_nombre=materia_nombre,
                nombre_convocatoria=convocatoria.nombre,
                fecha_hora_inicio=turno.fecha_hora_inicio,
                fecha_hora_fin=turno.fecha_hora_fin,
                cupo_total=turno.cupo_maximo,
                cupo_disponible=max(0, cupo_disponible),
                mi_reserva_id=mi_reserva_id
            ))
            
        return disponibles

    async def reservar_coloquio(self, alumno_id: UUID, request: 'ReservaColoquioRequest') -> 'ReservaColoquioResponse':
        from models.coloquios import TurnoColoquio, ConvocatoriaColoquio, CandidatoColoquio, ReservaColoquio, EstadoReserva, EstadoTurno
        from schemas.coloquio import ReservaColoquioResponse

        query_turno = select(TurnoColoquio).where(
            and_(
                TurnoColoquio.id == request.turno_id,
                TurnoColoquio.tenant_id == self.tenant_id,
                TurnoColoquio.estado == EstadoTurno.ACTIVO
            )
        ).with_for_update()
        
        result_turno = await self.session.execute(query_turno)
        turno = result_turno.scalar_one_or_none()

        if not turno:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turno no encontrado o inactivo.")

        if turno.cupos_ocupados >= turno.cupo_maximo:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay cupos disponibles en este turno.")

        query_candidato = select(CandidatoColoquio).where(
            and_(
                CandidatoColoquio.convocatoria_id == turno.convocatoria_id,
                CandidatoColoquio.usuario_id == alumno_id,
                CandidatoColoquio.habilitado == True,
                CandidatoColoquio.deleted_at.is_(None)
            )
        )
        result_candidato = await self.session.execute(query_candidato)
        candidato = result_candidato.scalar_one_or_none()

        if not candidato:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No se encuentra habilitado para este coloquio.")

        query_reserva_existente = select(ReservaColoquio).where(
            and_(
                ReservaColoquio.convocatoria_id == turno.convocatoria_id,
                ReservaColoquio.usuario_id == alumno_id,
                ReservaColoquio.estado == EstadoReserva.RESERVADA,
                ReservaColoquio.deleted_at.is_(None)
            )
        )
        result_existente = await self.session.execute(query_reserva_existente)
        reserva_existente = result_existente.scalar_one_or_none()

        if reserva_existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya posee una reserva activa para esta convocatoria.")

        turno.cupos_ocupados += 1

        reserva = ReservaColoquio(
            tenant_id=self.tenant_id,
            convocatoria_id=turno.convocatoria_id,
            turno_id=turno.id,
            usuario_id=alumno_id,
            estado=EstadoReserva.RESERVADA
        )
        
        self.session.add(reserva)
        await self.session.commit()
        await self.session.refresh(reserva)
        
        return ReservaColoquioResponse(
            id=reserva.id,
            turno_id=reserva.turno_id,
            alumno_id=reserva.usuario_id,
            fecha_reserva=reserva.created_at or datetime.now(timezone.utc),
            estado=reserva.estado.value
        )

    async def cancelar_reserva(self, alumno_id: UUID, reserva_id: UUID) -> None:
        from models.coloquios import ReservaColoquio, EstadoReserva, TurnoColoquio
        reserva = await self.session.get(ReservaColoquio, reserva_id)
        if not reserva or reserva.tenant_id != self.tenant_id or reserva.usuario_id != alumno_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
            
        reserva.estado = EstadoReserva.CANCELADA
        
        turno = await self.session.get(TurnoColoquio, reserva.turno_id)
        if turno and turno.cupos_ocupados > 0:
            turno.cupos_ocupados -= 1
            
        await self.session.commit()

    async def listar_agenda_reservas(self, convocatoria_id: UUID) -> list[dict]:
        from models.coloquios import ReservaColoquio, TurnoColoquio, EstadoReserva
        from models.user import Usuario

        query = (
            select(ReservaColoquio, TurnoColoquio, Usuario)
            .join(TurnoColoquio, TurnoColoquio.id == ReservaColoquio.turno_id)
            .join(Usuario, Usuario.id == ReservaColoquio.usuario_id)
            .where(
                and_(
                    ReservaColoquio.tenant_id == self.tenant_id,
                    ReservaColoquio.convocatoria_id == convocatoria_id,
                    ReservaColoquio.estado == EstadoReserva.RESERVADA,
                    ReservaColoquio.deleted_at.is_(None)
                )
            )
            .order_by(TurnoColoquio.fecha_hora_inicio, Usuario.apellido, Usuario.nombre)
        )
        
        result = await self.session.execute(query)
        rows = result.all()
        
        agenda = []
        for reserva, turno, usuario in rows:
            agenda.append({
                "reserva_id": reserva.id,
                "turno_id": turno.id,
                "fecha_hora_inicio": turno.fecha_hora_inicio,
                "fecha_hora_fin": turno.fecha_hora_fin,
                "alumno_id": usuario.id,
                "alumno_nombre": usuario.nombre,
                "alumno_apellido": usuario.apellido,
                "alumno_email": usuario.email, # En un caso real podría estar enmascarado
                "estado_reserva": reserva.estado.value
            })
            
        return agenda
