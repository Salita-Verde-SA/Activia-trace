from datetime import timedelta, date, datetime, timezone
from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from fastapi import HTTPException
from models.encuentros import SlotEncuentro, InstanciaEncuentro, Guardia, DiaSemana, EstadoInstancia, EstadoGuardia
from schemas.encuentro import SlotEncuentroCreate, InstanciaEncuentroUpdate
from schemas.guardia import GuardiaCreate

class EncuentroService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def listar_instancias_por_materia(self, materia_id: UUID) -> List[InstanciaEncuentro]:
        stmt = (
            select(InstanciaEncuentro)
            .where(
                InstanciaEncuentro.tenant_id == self.tenant_id,
                InstanciaEncuentro.materia_id == materia_id,
            )
            .order_by(InstanciaEncuentro.fecha, InstanciaEncuentro.hora)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def listar_mis_instancias(self, usuario_id: UUID) -> List[InstanciaEncuentro]:
        from models.asignacion import Asignacion
        stmt = (
            select(InstanciaEncuentro)
            .join(SlotEncuentro, InstanciaEncuentro.slot_id == SlotEncuentro.id)
            .join(Asignacion, SlotEncuentro.asignacion_id == Asignacion.id)
            .where(
                InstanciaEncuentro.tenant_id == self.tenant_id,
                Asignacion.usuario_id == usuario_id,
                Asignacion.deleted_at.is_(None),
                InstanciaEncuentro.fecha >= date.today(),
            )
            .order_by(InstanciaEncuentro.fecha, InstanciaEncuentro.hora)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def listar_instancias_alumno(self, usuario_id: UUID) -> List[InstanciaEncuentro]:
        from models.padron import EntradaPadron, VersionPadron
        stmt = (
            select(InstanciaEncuentro)
            .join(VersionPadron, InstanciaEncuentro.materia_id == VersionPadron.materia_id)
            .join(EntradaPadron, EntradaPadron.version_id == VersionPadron.id)
            .where(
                InstanciaEncuentro.tenant_id == self.tenant_id,
                EntradaPadron.usuario_id == usuario_id,
                EntradaPadron.deleted_at.is_(None),
                VersionPadron.deleted_at.is_(None),
                VersionPadron.activa == True,
                InstanciaEncuentro.fecha >= date.today(),
            )
            .order_by(InstanciaEncuentro.fecha, InstanciaEncuentro.hora)
            .distinct()
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def crear_encuentro(self, asignacion_id: UUID, data: SlotEncuentroCreate) -> dict:
        if data.cant_semanas > 0:
            if not data.fecha_inicio or not data.dia_semana:
                raise HTTPException(status_code=400, detail="Recurrent encounters need fecha_inicio and dia_semana")
            return await self._crear_recurrente(asignacion_id, data)
        else:
            if not data.fecha_unica:
                raise HTTPException(status_code=400, detail="Unique encounter needs fecha_unica")
            return await self._crear_unico(asignacion_id, data)

    async def _crear_recurrente(self, asignacion_id: UUID, data: SlotEncuentroCreate) -> dict:
        slot = SlotEncuentro(
            tenant_id=self.tenant_id,
            asignacion_id=asignacion_id,
            materia_id=data.materia_id,
            titulo=data.titulo,
            hora=data.hora,
            dia_semana=data.dia_semana,
            fecha_inicio=data.fecha_inicio,
            cant_semanas=data.cant_semanas,
            meet_url=data.meet_url
        )
        self.db.add(slot)
        await self.db.flush()

        instancias = []
        current_date = data.fecha_inicio
        weekday_map = {
            DiaSemana.LUNES: 0,
            DiaSemana.MARTES: 1,
            DiaSemana.MIERCOLES: 2,
            DiaSemana.JUEVES: 3,
            DiaSemana.VIERNES: 4,
            DiaSemana.SABADO: 5,
            DiaSemana.DOMINGO: 6,
        }
        target_weekday = weekday_map[data.dia_semana]
        while current_date.weekday() != target_weekday:
            current_date += timedelta(days=1)

        for _ in range(data.cant_semanas):
            instancia = InstanciaEncuentro(
                tenant_id=self.tenant_id,
                slot_id=slot.id,
                materia_id=data.materia_id,
                fecha=current_date,
                hora=data.hora,
                titulo=data.titulo,
                estado=EstadoInstancia.PROGRAMADO,
                meet_url=data.meet_url
            )
            self.db.add(instancia)
            instancias.append(instancia)
            current_date += timedelta(weeks=1)

        await self.db.commit()
        await self.db.refresh(slot)
        for i in instancias:
            await self.db.refresh(i)

        return {"slot": slot, "instancias": instancias}

    async def _crear_unico(self, asignacion_id: UUID, data: SlotEncuentroCreate) -> dict:
        slot = SlotEncuentro(
            tenant_id=self.tenant_id,
            asignacion_id=asignacion_id,
            materia_id=data.materia_id,
            titulo=data.titulo,
            hora=data.hora,
            fecha_unica=data.fecha_unica,
            cant_semanas=0,
            meet_url=data.meet_url
        )
        self.db.add(slot)
        await self.db.flush()

        instancia = InstanciaEncuentro(
            tenant_id=self.tenant_id,
            slot_id=slot.id,
            materia_id=data.materia_id,
            fecha=data.fecha_unica,
            hora=data.hora,
            titulo=data.titulo,
            estado=EstadoInstancia.PROGRAMADO,
            meet_url=data.meet_url
        )
        self.db.add(instancia)
        await self.db.commit()
        await self.db.refresh(slot)
        await self.db.refresh(instancia)

        return {"slot": slot, "instancias": [instancia]}

    async def editar_instancia(self, instancia_id: UUID, data: InstanciaEncuentroUpdate) -> InstanciaEncuentro:
        stmt = select(InstanciaEncuentro).where(
            InstanciaEncuentro.id == instancia_id,
            InstanciaEncuentro.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        instancia = result.scalar_one_or_none()

        if not instancia:
            raise HTTPException(status_code=404, detail="Instancia no encontrada")

        if data.estado is not None:
            instancia.estado = data.estado
        if data.meet_url is not None:
            instancia.meet_url = data.meet_url
        if data.video_url is not None:
            instancia.video_url = data.video_url
        if data.comentario is not None:
            instancia.comentario = data.comentario

        await self.db.commit()
        await self.db.refresh(instancia)
        return instancia

    async def generar_html_moodle(self, materia_id: UUID) -> str:
        stmt = select(InstanciaEncuentro).where(
            InstanciaEncuentro.materia_id == materia_id,
            InstanciaEncuentro.tenant_id == self.tenant_id,
            InstanciaEncuentro.estado == EstadoInstancia.PROGRAMADO
        ).order_by(InstanciaEncuentro.fecha, InstanciaEncuentro.hora)
        result = await self.db.execute(stmt)
        instancias = result.scalars().all()

        html = "<table class='table table-bordered table-striped'>\n"
        html += "  <thead><tr><th>Fecha</th><th>Hora</th><th>Título</th><th>Enlace</th></tr></thead>\n"
        html += "  <tbody>\n"
        for i in instancias:
            link = f"<a href='{i.meet_url}' target='_blank'>Unirse</a>" if i.meet_url else "N/A"
            fecha_str = i.fecha.strftime('%d/%m/%Y')
            hora_str = i.hora.strftime('%H:%M')
            html += f"    <tr><td>{fecha_str}</td><td>{hora_str}</td><td>{i.titulo}</td><td>{link}</td></tr>\n"
        html += "  </tbody>\n</table>"
        return html

class GuardiaService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def registrar_guardia(self, asignacion_id: UUID, data: GuardiaCreate) -> Guardia:
        guardia = Guardia(
            tenant_id=self.tenant_id,
            asignacion_id=asignacion_id,
            materia_id=data.materia_id,
            carrera_id=data.carrera_id,
            cohorte_id=data.cohorte_id,
            dia=data.dia,
            horario=data.horario,
            comentarios=data.comentarios,
            creada_at=datetime.now(timezone.utc),
            estado=EstadoGuardia.REALIZADA
        )
        self.db.add(guardia)
        await self.db.commit()
        await self.db.refresh(guardia)
        return guardia

    async def mis_guardias(self, usuario_id: UUID) -> List[Guardia]:
        from models.asignacion import Asignacion
        stmt = (
            select(Guardia)
            .join(Asignacion, Guardia.asignacion_id == Asignacion.id)
            .where(
                Guardia.tenant_id == self.tenant_id,
                Asignacion.usuario_id == usuario_id,
                Asignacion.deleted_at.is_(None),
            )
            .order_by(Guardia.creada_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def exportar_guardias(self, fecha_desde: date, fecha_hasta: date) -> List[Guardia]:
        stmt = select(Guardia).where(
            Guardia.tenant_id == self.tenant_id,
            Guardia.creada_at >= text(f"'{fecha_desde.isoformat()} 00:00:00+00'::timestamp with time zone"),
            Guardia.creada_at <= text(f"'{fecha_hasta.isoformat()} 23:59:59+00'::timestamp with time zone")
        ).order_by(Guardia.creada_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
