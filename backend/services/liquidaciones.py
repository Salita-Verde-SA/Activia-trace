from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import date, datetime, timezone

from models.liquidaciones import Liquidacion, EstadoLiquidacion, SalarioBase, SalarioPlus, Factura
from models.user import Usuario
from models.rbac import Rol
from models.asignacion import Asignacion
from models.estructura import Materia
from models.audit import AuditLog
from schemas.liquidacion import LiquidacionPrecalculo, LiquidacionResponse

class LiquidacionService:
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def _get_salario_base(self, rol: str, periodo_fecha: date) -> float:
        query = select(SalarioBase).where(
            SalarioBase.tenant_id == self.tenant_id,
            SalarioBase.rol == rol,
            SalarioBase.fecha_desde <= periodo_fecha,
            or_(SalarioBase.fecha_hasta == None, SalarioBase.fecha_hasta >= periodo_fecha)
        )
        sb = (await self.db.execute(query)).scalars().first()
        return sb.monto if sb else 0.0

    async def _get_salario_plus(self, rol: str, clave_plus: str, periodo_fecha: date) -> float:
        query = select(SalarioPlus).where(
            SalarioPlus.tenant_id == self.tenant_id,
            SalarioPlus.rol == rol,
            SalarioPlus.clave_plus == clave_plus,
            SalarioPlus.fecha_desde <= periodo_fecha,
            or_(SalarioPlus.fecha_hasta == None, SalarioPlus.fecha_hasta >= periodo_fecha)
        )
        sp = (await self.db.execute(query)).scalars().first()
        return sp.monto if sp else 0.0

    async def calcular_liquidacion_usuario(self, usuario_id: UUID, mes: int, anio: int) -> LiquidacionPrecalculo:
        # 1. Determinar fecha representativa del período (ej. primer día del mes)
        periodo_fecha = date(anio, mes, 1)
        
        # 2. Buscar asignaciones vigentes en el período
        # Para simplificar MVP, buscaremos asignaciones que intersecten el mes/año
        # Esto asume que asignacion.fecha_inicio y fecha_fin están disponibles.
        # Si no, asumimos las asignaciones activas actuales
        query_asignaciones = select(Asignacion).options(
            selectinload(Asignacion.materia),
            selectinload(Asignacion.rol)
        ).where(
            Asignacion.tenant_id == self.tenant_id,
            Asignacion.usuario_id == usuario_id
            # Agregar filtro por vigencia en el periodo_fecha si corresponde
        )
        asignaciones = (await self.db.execute(query_asignaciones)).scalars().all()
        
        # 3. Sumar Base y Plus
        monto_base = 0.0
        monto_plus = 0.0
        
        # Para controlar el plus "una sola vez por clave y rol"
        plus_aplicados = set() # Set of (rol, clave_plus)
        es_nexo = False
        
        detalle = {
            "asignaciones": []
        }

        # Cache base amounts
        cache_base = {}

        for asig in asignaciones:
            rol = asig.rol.nombre if asig.rol else None
            if not rol: continue

            if rol == "NEXO":
                es_nexo = True
                
            if rol not in cache_base:
                cache_base[rol] = await self._get_salario_base(rol, periodo_fecha)
                
            base_aplicada = cache_base[rol]
            monto_base += base_aplicada
            
            # Plus
            plus_aplicada = 0.0
            materia = asig.materia
            if materia and materia.clave_plus:
                clave_plus = materia.clave_plus
                if (rol, clave_plus) not in plus_aplicados:
                    plus_aplicada = await self._get_salario_plus(rol, clave_plus, periodo_fecha)
                    monto_plus += plus_aplicada
                    plus_aplicados.add((rol, clave_plus))
            
            detalle["asignaciones"].append({
                "asignacion_id": str(asig.id),
                "rol": rol,
                "materia": materia.nombre if materia else "N/A",
                "clave_plus": materia.clave_plus if materia else None,
                "monto_base": base_aplicada,
                "monto_plus": plus_aplicada
            })

        # 4. Chequear si emitió factura
        query_fact = select(Factura).where(
            Factura.tenant_id == self.tenant_id,
            Factura.usuario_id == usuario_id,
            Factura.periodo_mes == mes,
            Factura.periodo_anio == anio
        )
        factura = (await self.db.execute(query_fact)).scalars().first()
        excluido_por_factura = factura is not None

        return LiquidacionPrecalculo(
            usuario_id=usuario_id,
            periodo_mes=mes,
            periodo_anio=anio,
            monto_base=monto_base,
            monto_plus=monto_plus,
            monto_total=monto_base + monto_plus,
            es_nexo=es_nexo,
            excluido_por_factura=excluido_por_factura,
            detalle_calculo=detalle
        )

    async def generar_pre_liquidaciones(self, mes: int, anio: int) -> List[LiquidacionPrecalculo]:
        # Para MVP: iterar todos los usuarios con asignaciones
        # En prod: Hacer un join o agrupar para mayor performance
        query_users = select(Usuario.id).where(Usuario.tenant_id == self.tenant_id)
        user_ids = (await self.db.execute(query_users)).scalars().all()
        
        resultados = []
        for uid in user_ids:
            pre = await self.calcular_liquidacion_usuario(uid, mes, anio)
            # Solo incluir si tiene montos (es decir, tuvo asignaciones)
            if pre.monto_total > 0:
                resultados.append(pre)
                
        return resultados

    async def cerrar_liquidacion_mensual(self, usuario_id: UUID, mes: int, anio: int, admin_id: UUID) -> LiquidacionResponse:
        # Verificar si ya existe una cerrada
        query_existe = select(Liquidacion).where(
            Liquidacion.tenant_id == self.tenant_id,
            Liquidacion.usuario_id == usuario_id,
            Liquidacion.periodo_mes == mes,
            Liquidacion.periodo_anio == anio
        )
        liq_db = (await self.db.execute(query_existe)).scalars().first()
        
        if liq_db and liq_db.estado == EstadoLiquidacion.CERRADA:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La liquidación ya está cerrada para este período.")
            
        # Calcular
        pre = await self.calcular_liquidacion_usuario(usuario_id, mes, anio)
        
        if not liq_db:
            liq_db = Liquidacion(
                tenant_id=self.tenant_id,
                usuario_id=usuario_id,
                periodo_mes=mes,
                periodo_anio=anio,
                monto_base=pre.monto_base,
                monto_plus=pre.monto_plus,
                monto_total=pre.monto_total,
                es_nexo=pre.es_nexo,
                excluido_por_factura=pre.excluido_por_factura,
                estado=EstadoLiquidacion.CERRADA,
                detalle_calculo=pre.detalle_calculo
            )
            self.db.add(liq_db)
        else:
            liq_db.monto_base = pre.monto_base
            liq_db.monto_plus = pre.monto_plus
            liq_db.monto_total = pre.monto_total
            liq_db.es_nexo = pre.es_nexo
            liq_db.excluido_por_factura = pre.excluido_por_factura
            liq_db.estado = EstadoLiquidacion.CERRADA
            liq_db.detalle_calculo = pre.detalle_calculo
            
        # Registro de auditoría
        audit = AuditLog(
            tenant_id=self.tenant_id,
            usuario_id=admin_id,
            accion="LIQUIDACION_CERRAR",
            entidad="Liquidacion",
            entidad_id=liq_db.id, # si es nuevo, aun no tiene ID asignado (postgres generará en flush). Hacemos flush.
            detalles={"usuario_id": str(usuario_id), "mes": mes, "anio": anio, "monto_total": pre.monto_total}
        )
        self.db.add(audit)
        
        await self.db.commit()
        await self.db.refresh(liq_db)
        
        return LiquidacionResponse.model_validate(liq_db, from_attributes=True)
