from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Dict, Any
from collections import defaultdict

from models.calificacion import Calificacion
from models.padron import EntradaPadron, VersionPadron
from schemas.analisis import (
    ReporteAtrasadosResponse, AlumnoAtrasado, CalificacionSimplificada,
    RankingActividadesResponse, ActividadRanking,
    SabanaResponse, SabanaAlumno
)

class AnalisisService:
    @staticmethod
    async def _get_calificaciones_padron_activo(db: AsyncSession, tenant_id: UUID, materia_id: UUID):
        stmt_vp = select(VersionPadron).where(
            VersionPadron.tenant_id == tenant_id,
            VersionPadron.materia_id == materia_id,
            VersionPadron.es_activa == True,
            VersionPadron.deleted_at.is_(None)
        )
        vp_result = await db.execute(stmt_vp)
        vp = vp_result.scalars().first()
        
        if not vp:
            return [], []
            
        stmt_ep = select(EntradaPadron).where(
            EntradaPadron.tenant_id == tenant_id,
            EntradaPadron.version_id == vp.id,
            EntradaPadron.deleted_at.is_(None)
        )
        ep_result = await db.execute(stmt_ep)
        entradas = ep_result.scalars().all()
        
        entrada_ids = [e.id for e in entradas]
        if not entrada_ids:
            return entradas, []
            
        stmt_c = select(Calificacion).where(
            Calificacion.tenant_id == tenant_id,
            Calificacion.entrada_padron_id.in_(entrada_ids),
            Calificacion.deleted_at.is_(None)
        )
        c_result = await db.execute(stmt_c)
        calificaciones = c_result.scalars().all()
        
        return entradas, calificaciones

    @staticmethod
    async def obtener_alumnos_atrasados(db: AsyncSession, tenant_id: UUID, materia_id: UUID) -> ReporteAtrasadosResponse:
        entradas, calificaciones = await AnalisisService._get_calificaciones_padron_activo(db, tenant_id, materia_id)
        
        calif_por_alumno = defaultdict(list)
        for c in calificaciones:
            calif_por_alumno[c.entrada_padron_id].append(c)
            
        alumnos_atrasados = []
        for e in entradas:
            notas_alumno = calif_por_alumno.get(e.id, [])
            no_aprobadas = [
                CalificacionSimplificada(
                    actividad_nombre=n.actividad_nombre,
                    nota_numerica=n.nota_numerica,
                    nota_textual=n.nota_textual,
                    aprobado=n.aprobado
                ) for n in notas_alumno if not n.aprobado
            ]
            
            if no_aprobadas:
                alumnos_atrasados.append(
                    AlumnoAtrasado(
                        entrada_padron_id=e.id,
                        email=e.email,
                        nombre=e.nombre,
                        apellido=e.apellido,
                        actividades_no_aprobadas=no_aprobadas
                    )
                )
                
        return ReporteAtrasadosResponse(
            materia_id=materia_id,
            total_alumnos_padron=len(entradas),
            total_alumnos_atrasados=len(alumnos_atrasados),
            alumnos_atrasados=alumnos_atrasados
        )

    @staticmethod
    async def obtener_ranking_actividades(db: AsyncSession, tenant_id: UUID, materia_id: UUID) -> RankingActividadesResponse:
        entradas, calificaciones = await AnalisisService._get_calificaciones_padron_activo(db, tenant_id, materia_id)
        total_alumnos = len(entradas)
        
        if total_alumnos == 0:
            return RankingActividadesResponse(materia_id=materia_id, actividades=[])
            
        eval_por_actividad = defaultdict(int)
        aprob_por_actividad = defaultdict(int)
        
        for c in calificaciones:
            act = c.actividad_nombre
            eval_por_actividad[act] += 1
            if c.aprobado:
                aprob_por_actividad[act] += 1
                
        ranking = []
        for act in eval_por_actividad.keys():
            ranking.append(ActividadRanking(
                actividad_nombre=act,
                total_evaluados=total_alumnos,
                total_aprobados=aprob_por_actividad[act],
                porcentaje_aprobacion=round((aprob_por_actividad[act] / total_alumnos) * 100, 2)
            ))
            
        ranking.sort(key=lambda x: x.porcentaje_aprobacion, reverse=True)
        
        return RankingActividadesResponse(materia_id=materia_id, actividades=ranking)

    @staticmethod
    async def obtener_sabana_notas(db: AsyncSession, tenant_id: UUID, materia_id: UUID) -> SabanaResponse:
        entradas, calificaciones = await AnalisisService._get_calificaciones_padron_activo(db, tenant_id, materia_id)
        
        actividades_set = set()
        for c in calificaciones:
            actividades_set.add(c.actividad_nombre)
            
        actividades_headers = sorted(list(actividades_set))
        
        calif_por_alumno = defaultdict(dict)
        for c in calificaciones:
            calif_por_alumno[c.entrada_padron_id][c.actividad_nombre] = CalificacionSimplificada(
                actividad_nombre=c.actividad_nombre,
                nota_numerica=c.nota_numerica,
                nota_textual=c.nota_textual,
                aprobado=c.aprobado
            )
            
        sabana_alumnos = []
        for e in entradas:
            sabana_alumnos.append(SabanaAlumno(
                entrada_padron_id=e.id,
                email=e.email,
                nombre=e.nombre,
                apellido=e.apellido,
                calificaciones=calif_por_alumno.get(e.id, {})
            ))
            
        return SabanaResponse(
            materia_id=materia_id,
            actividades_headers=actividades_headers,
            alumnos=sabana_alumnos
        )
