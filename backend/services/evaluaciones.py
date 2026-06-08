from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException, status

from models.evaluaciones import Evaluacion, ReservaEvaluacion, ResultadoEvaluacion, EstadoReserva
from models.user import Usuario
from models.calificacion import Calificacion, UmbralMateria
from schemas.evaluacion import EvaluacionCreate, EvaluacionResponse, ReservaImport, ReservaResponse, ResultadoCreate, ResultadoResponse, EvaluacionMetrics

class EvaluacionService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def crear_evaluacion(self, data: EvaluacionCreate) -> EvaluacionResponse:
        evaluacion = Evaluacion(
            tenant_id=self.tenant_id,
            materia_id=data.materia_id,
            cohorte_id=data.cohorte_id,
            tipo=data.tipo,
            instancia=data.instancia,
            dias_disponibles=data.dias_disponibles
        )
        self.db.add(evaluacion)
        await self.db.commit()
        await self.db.refresh(evaluacion)
        return EvaluacionResponse.model_validate(evaluacion, from_attributes=True)

    async def listar_globales(self) -> List[EvaluacionResponse]:
        query = select(Evaluacion).where(Evaluacion.tenant_id == self.tenant_id)
        result = await self.db.execute(query)
        evaluaciones = result.scalars().all()
        return [EvaluacionResponse.model_validate(e, from_attributes=True) for e in evaluaciones]

    async def importar_reservas(self, evaluacion_id: UUID, data: ReservaImport) -> List[ReservaResponse]:
        eval_query = select(Evaluacion).where(
            Evaluacion.id == evaluacion_id,
            Evaluacion.tenant_id == self.tenant_id
        )
        eval_res = await self.db.execute(eval_query)
        eval_obj = eval_res.scalar_one_or_none()
        if not eval_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluacion no encontrada")

        reservas = []
        for alumno_id in data.alumnos_ids:
            # Check if usuario exists
            usr_query = select(Usuario).where(
                Usuario.id == alumno_id,
                Usuario.tenant_id == self.tenant_id
            )
            usr_res = await self.db.execute(usr_query)
            if not usr_res.scalar_one_or_none():
                continue # Skip or raise error, for now skip

            reserva = ReservaEvaluacion(
                tenant_id=self.tenant_id,
                evaluacion_id=evaluacion_id,
                alumno_id=alumno_id,
                fecha_hora=data.fecha_hora,
                estado=EstadoReserva.ACTIVA
            )
            self.db.add(reserva)
            reservas.append(reserva)

        await self.db.commit()
        for r in reservas:
            await self.db.refresh(r)
        
        return [ReservaResponse.model_validate(r, from_attributes=True) for r in reservas]

    async def registrar_resultados(self, evaluacion_id: UUID, resultados: List[ResultadoCreate]) -> List[ResultadoResponse]:
        eval_query = select(Evaluacion).where(
            Evaluacion.id == evaluacion_id,
            Evaluacion.tenant_id == self.tenant_id
        )
        eval_res = await self.db.execute(eval_query)
        eval_obj = eval_res.scalar_one_or_none()
        if not eval_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluacion no encontrada")

        created_resultados = []
        for res_data in resultados:
            # Upsert logic can be added here, for now we just insert
            # Check existing result
            existing_query = select(ResultadoEvaluacion).where(
                ResultadoEvaluacion.evaluacion_id == evaluacion_id,
                ResultadoEvaluacion.alumno_id == res_data.alumno_id,
                ResultadoEvaluacion.tenant_id == self.tenant_id
            )
            existing_res = await self.db.execute(existing_query)
            existing = existing_res.scalar_one_or_none()

            if existing:
                existing.nota_final = res_data.nota_final
                created_resultados.append(existing)
            else:
                nuevo_resultado = ResultadoEvaluacion(
                    tenant_id=self.tenant_id,
                    evaluacion_id=evaluacion_id,
                    alumno_id=res_data.alumno_id,
                    nota_final=res_data.nota_final
                )
                self.db.add(nuevo_resultado)
                created_resultados.append(nuevo_resultado)

        await self.db.commit()
        for r in created_resultados:
            await self.db.refresh(r)

        return [ResultadoResponse.model_validate(r, from_attributes=True) for r in created_resultados]

    async def obtener_metricas(self, evaluacion_id: UUID) -> EvaluacionMetrics:
        # Get total inscriptos
        insc_query = select(func.count(ReservaEvaluacion.id)).where(
            ReservaEvaluacion.evaluacion_id == evaluacion_id,
            ReservaEvaluacion.tenant_id == self.tenant_id,
            ReservaEvaluacion.estado == EstadoReserva.ACTIVA
        )
        total_inscriptos = (await self.db.execute(insc_query)).scalar() or 0

        # Get total presentados
        pres_query = select(func.count(ResultadoEvaluacion.id)).where(
            ResultadoEvaluacion.evaluacion_id == evaluacion_id,
            ResultadoEvaluacion.tenant_id == self.tenant_id
        )
        total_presentados = (await self.db.execute(pres_query)).scalar() or 0

        # We need materia_id to get umbral
        eval_query = select(Evaluacion).where(
            Evaluacion.id == evaluacion_id,
            Evaluacion.tenant_id == self.tenant_id
        )
        eval_obj = (await self.db.execute(eval_query)).scalar_one_or_none()

        if not eval_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluacion no encontrada")

        umbral_query = select(UmbralMateria).where(
            UmbralMateria.materia_id == eval_obj.materia_id,
            UmbralMateria.tenant_id == self.tenant_id
        ).limit(1)
        umbral_obj = (await self.db.execute(umbral_query)).scalar_one_or_none()
        umbral_pct = umbral_obj.umbral_pct if umbral_obj else 60
        valores_aprobatorios = umbral_obj.valores_aprobatorios if umbral_obj and umbral_obj.valores_aprobatorios else ["Aprobado", "A", "Satisfactorio"]

        # Calculate aprobados
        resultados_query = select(ResultadoEvaluacion).where(
            ResultadoEvaluacion.evaluacion_id == evaluacion_id,
            ResultadoEvaluacion.tenant_id == self.tenant_id
        )
        resultados = (await self.db.execute(resultados_query)).scalars().all()
        
        aprobados = 0
        for res in resultados:
            try:
                num = float(res.nota_final)
                # Convert grade typically on 0-10 or 0-100 scale to percentage, assume 0-100 for simplicity or check if <= 10
                if num <= 10:
                    num = num * 10
                if num >= umbral_pct:
                    aprobados += 1
            except ValueError:
                # String value
                if res.nota_final in valores_aprobatorios:
                    aprobados += 1

        total_ausentes = total_inscriptos - total_presentados
        if total_ausentes < 0:
            total_ausentes = 0

        porcentaje_aprobados = 0.0
        if total_presentados > 0:
            porcentaje_aprobados = round((aprobados / total_presentados) * 100, 2)

        return EvaluacionMetrics(
            evaluacion_id=evaluacion_id,
            total_inscriptos=total_inscriptos,
            total_presentados=total_presentados,
            total_ausentes=total_ausentes,
            porcentaje_aprobados=porcentaje_aprobados
        )
