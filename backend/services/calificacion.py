from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import csv
import io
import logging
from typing import List, Any

from models.calificacion import Calificacion, UmbralMateria
from models.padron import EntradaPadron
from models.audit import AuditLog
from schemas.calificacion import UmbralCreate, ColumnMap, ImportConfirmRequest, PreviewResponse

logger = logging.getLogger(__name__)

class UmbralService:
    @staticmethod
    async def get_umbral(db: AsyncSession, tenant_id: UUID, materia_id: UUID, docente_id: UUID | None = None) -> UmbralMateria | None:
        stmt = select(UmbralMateria).where(
            UmbralMateria.tenant_id == tenant_id,
            UmbralMateria.materia_id == materia_id,
            UmbralMateria.deleted_at.is_(None)
        )
        if docente_id:
            stmt = stmt.where(UmbralMateria.docente_id == docente_id)
        else:
            stmt = stmt.where(UmbralMateria.docente_id.is_(None))
            
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def set_umbral(db: AsyncSession, tenant_id: UUID, data: UmbralCreate) -> UmbralMateria:
        umbral = await UmbralService.get_umbral(db, tenant_id, data.materia_id, data.docente_id)
        if umbral:
            umbral.umbral_pct = data.umbral_pct
            umbral.valores_aprobatorios = data.valores_aprobatorios
        else:
            umbral = UmbralMateria(
                tenant_id=tenant_id,
                materia_id=data.materia_id,
                docente_id=data.docente_id,
                umbral_pct=data.umbral_pct,
                valores_aprobatorios=data.valores_aprobatorios
            )
            db.add(umbral)
        await db.commit()
        await db.refresh(umbral)
        return umbral

class CalificacionService:
    @staticmethod
    def generar_vista_previa(file_content: bytes) -> PreviewResponse:
        content = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        
        headers = reader.fieldnames or []
        ignorar_por_defecto = ["nombre", "apellido", "email", "first name", "last name", "email address", "id", "institución", "departamento", "dirección de correo"]
        
        columnas_detectadas = []
        for h in headers:
            h_lower = h.lower().strip()
            ignorar = any(x in h_lower for x in ignorar_por_defecto)
            es_num = "calificaci" in h_lower or "total" in h_lower
            columnas_detectadas.append(ColumnMap(nombre_columna=h, es_numerica=es_num, ignorar=ignorar))
            
        preview_data = []
        for i, row in enumerate(reader):
            if i >= 5:
                break
            preview_data.append(row)
            
        return PreviewResponse(
            columnas_detectadas=columnas_detectadas,
            total_filas=sum(1 for _ in reader) + len(preview_data),
            preview_data=preview_data
        )

    @staticmethod
    def calcular_aprobacion(nota_numerica: float | None, nota_textual: str | None, umbral: UmbralMateria | None) -> bool:
        if not umbral:
            default_pct = 60.0
            default_text = []
        else:
            default_pct = umbral.umbral_pct
            default_text = [t.lower().strip() for t in umbral.valores_aprobatorios]

        if nota_numerica is not None:
            nota_norm = nota_numerica * 10.0 if nota_numerica <= 10.0 and default_pct > 10.0 else nota_numerica
            return nota_norm >= default_pct

        if nota_textual is not None:
            # If the text value looks like a number, evaluate it numerically against the umbral.
            try:
                nota_as_num = float(nota_textual.replace(',', '.'))
                nota_norm = nota_as_num * 10.0 if nota_as_num <= 10.0 and default_pct > 10.0 else nota_as_num
                return nota_norm >= default_pct
            except ValueError:
                pass
            return nota_textual.lower().strip() in default_text

        return False

    @staticmethod
    async def confirmar_importacion(
        db: AsyncSession,
        tenant_id: UUID,
        actor_id: UUID,
        data: ImportConfirmRequest,
        file_content: bytes
    ) -> int:
        content = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        
        umbral = await UmbralService.get_umbral(db, tenant_id, data.materia_id, None)
        
        entradas_result = await db.execute(
            select(EntradaPadron).where(
                EntradaPadron.tenant_id == tenant_id,
                EntradaPadron.version_id == data.version_padron_id,
                EntradaPadron.deleted_at.is_(None)
            )
        )
        entradas = {e.email.lower(): e.id for e in entradas_result.scalars().all() if e.email}
        
        columnas_a_importar = [c for c in data.columnas if not c.ignorar]
        calificaciones = []
        origen = "REPORTE_FINALIZACION" if data.es_reporte_finalizacion else "IMPORTADO_CSV"
        
        for row in reader:
            email = (row.get("email") or row.get("Email Address") or "").lower().strip()
            entrada_id = entradas.get(email)
            
            if not entrada_id:
                continue 
                
            for col in columnas_a_importar:
                val = row.get(col.nombre_columna)
                if not val or not str(val).strip() or str(val).strip() == "-":
                    continue
                    
                val_str = str(val).strip()
                nota_numerica = None
                nota_textual = None
                aprobado = False
                
                if data.es_reporte_finalizacion:
                    nota_textual = "Entregado"
                    aprobado = True
                else:
                    if col.es_numerica:
                        try:
                            nota_numerica = float(val_str.replace(",", "."))
                            if nota_numerica <= 10.0 and umbral and umbral.umbral_pct > 10.0:
                                nota_numerica *= 10.0
                        except ValueError:
                            nota_textual = val_str
                    else:
                        nota_textual = val_str
                        
                    aprobado = CalificacionService.calcular_aprobacion(nota_numerica, nota_textual, umbral)
                
                calif = Calificacion(
                    tenant_id=tenant_id,
                    entrada_padron_id=entrada_id,
                    actividad_nombre=col.nombre_columna,
                    nota_numerica=nota_numerica,
                    nota_textual=nota_textual,
                    aprobado=aprobado,
                    origen=origen
                )
                db.add(calif)
                calificaciones.append(calif)
                
        audit = AuditLog(
            tenant_id=tenant_id,
            actor_id=actor_id,
            accion="CALIFICACIONES_IMPORTAR",
            materia_id=data.materia_id,
            detalle={
                "version_padron_id": str(data.version_padron_id),
                "es_reporte_finalizacion": data.es_reporte_finalizacion,
                "columnas_importadas": len(columnas_a_importar),
                "registros_creados": len(calificaciones)
            },
            filas_afectadas=len(calificaciones)
        )
        db.add(audit)
        
        await db.commit()
        return len(calificaciones)

    @staticmethod
    async def obtener_estado_alumno(db: AsyncSession, tenant_id: UUID, alumno_id: UUID) -> List[Any]:
        from models.padron import EntradaPadron, VersionPadron
        from models.calificacion import Calificacion
        from models.estructura import Materia
        from schemas.calificacion import EstadoMateria, CalificacionSimplificada
        from collections import defaultdict

        entradas_result = await db.execute(
            select(EntradaPadron).where(
                EntradaPadron.tenant_id == tenant_id,
                EntradaPadron.usuario_id == alumno_id,
                EntradaPadron.deleted_at.is_(None),
            )
        )
        entradas = entradas_result.scalars().all()
        if not entradas:
            return []

        entrada_ids = [e.id for e in entradas]
        version_ids = list({e.version_id for e in entradas})

        versiones_result = await db.execute(
            select(VersionPadron).where(
                VersionPadron.id.in_(version_ids),
                VersionPadron.deleted_at.is_(None),
            )
        )
        versiones = {v.id: v for v in versiones_result.scalars().all()}

        materia_ids = list({v.materia_id for v in versiones.values()})
        materias_result = await db.execute(
            select(Materia).where(Materia.id.in_(materia_ids))
        )
        materias = {m.id: m.nombre for m in materias_result.scalars().all()}

        califs_result = await db.execute(
            select(Calificacion).where(
                Calificacion.tenant_id == tenant_id,
                Calificacion.entrada_padron_id.in_(entrada_ids),
                Calificacion.deleted_at.is_(None),
            )
        )
        califs_por_entrada = defaultdict(list)
        for c in califs_result.scalars().all():
            califs_por_entrada[c.entrada_padron_id].append(c)

        # Group by materia
        califs_por_materia: dict[UUID, list] = defaultdict(list)
        for entrada in entradas:
            version = versiones.get(entrada.version_id)
            if not version:
                continue
            for c in califs_por_entrada.get(entrada.id, []):
                califs_por_materia[version.materia_id].append(c)

        estados = []
        for materia_id in califs_por_materia:
            califs = califs_por_materia[materia_id]
            aprobadas = sum(1 for c in califs if c.aprobado)
            total = len(califs)
            if total == 0:
                estado = "sin_datos"
            elif aprobadas == total:
                estado = "promocionado"
            elif aprobadas > 0:
                estado = "regular"
            else:
                estado = "en_riesgo"

            nota_final_vals = [c.nota_numerica for c in califs if c.nota_numerica is not None]
            nota_final = round(sum(nota_final_vals) / len(nota_final_vals), 2) if nota_final_vals else None

            estados.append(EstadoMateria(
                materia_id=materia_id,
                materia_nombre=materias.get(materia_id, str(materia_id)),
                estado=estado,
                nota_final=nota_final,
                calificaciones=[
                    CalificacionSimplificada(
                        actividad_nombre=c.actividad_nombre,
                        nota_numerica=c.nota_numerica,
                        nota_textual=c.nota_textual,
                        aprobado=c.aprobado,
                    ) for c in califs
                ],
            ))

        return estados
