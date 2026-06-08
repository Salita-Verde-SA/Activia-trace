import pytest
from uuid import uuid4
from datetime import date
from fastapi import HTTPException
from models.liquidaciones import SalarioBase, SalarioPlus, Factura, Liquidacion, EstadoLiquidacion
from models.user import Usuario, RolUsuario
from models.asignacion import Asignacion
from models.estructura import Materia
from models.padron import InstanciaDictado
from services.liquidaciones import LiquidacionService

@pytest.mark.asyncio
async def test_calculo_salario_base_vigente(db_session, tenant_id):
    # Setup salarios base con distintas vigencias
    sb_old = SalarioBase(tenant_id=tenant_id, rol=RolUsuario.PROFESOR, monto=100.0, fecha_desde=date(2026, 1, 1), fecha_hasta=date(2026, 5, 31))
    sb_new = SalarioBase(tenant_id=tenant_id, rol=RolUsuario.PROFESOR, monto=200.0, fecha_desde=date(2026, 6, 1))
    db_session.add_all([sb_old, sb_new])
    await db_session.commit()
    
    service = LiquidacionService(db_session, tenant_id)
    
    val1 = await service._get_salario_base(RolUsuario.PROFESOR, date(2026, 5, 10))
    assert val1 == 100.0
    
    val2 = await service._get_salario_base(RolUsuario.PROFESOR, date(2026, 6, 5))
    assert val2 == 200.0

@pytest.mark.asyncio
async def test_plus_una_sola_vez_por_clave(db_session, tenant_id):
    service = LiquidacionService(db_session, tenant_id)
    
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="T", apellidos="T", email="t@t.com", dni="1", cuil="1", cbu="1", alias_cbu="1", banco="B", facturador=False)
    
    # 2 materias con misma clave 'PROG'
    mat1 = Materia(id=uuid4(), tenant_id=tenant_id, codigo="M1", nombre="Prog 1", clave_plus="PROG")
    mat2 = Materia(id=uuid4(), tenant_id=tenant_id, codigo="M2", nombre="Prog 2", clave_plus="PROG")
    
    inst1 = InstanciaDictado(id=uuid4(), tenant_id=tenant_id, materia_id=mat1.id, nombre="Com 1", anio=2026, cuatrimestre=1)
    inst2 = InstanciaDictado(id=uuid4(), tenant_id=tenant_id, materia_id=mat2.id, nombre="Com 2", anio=2026, cuatrimestre=1)
    
    asig1 = Asignacion(id=uuid4(), tenant_id=tenant_id, usuario_id=usr_id, rol=RolUsuario.PROFESOR, instancia_dictado_id=inst1.id)
    asig2 = Asignacion(id=uuid4(), tenant_id=tenant_id, usuario_id=usr_id, rol=RolUsuario.PROFESOR, instancia_dictado_id=inst2.id)
    
    sb = SalarioBase(tenant_id=tenant_id, rol=RolUsuario.PROFESOR, monto=100.0, fecha_desde=date(2026, 1, 1))
    sp = SalarioPlus(tenant_id=tenant_id, clave_plus="PROG", rol=RolUsuario.PROFESOR, monto=50.0, fecha_desde=date(2026, 1, 1))
    
    db_session.add_all([usr, mat1, mat2, inst1, inst2, asig1, asig2, sb, sp])
    await db_session.commit()
    
    # Base: 100 * 2 asignaciones = 200
    # Plus: 50 * 1 vez por clave 'PROG' = 50
    # Total = 250
    liq = await service.calcular_liquidacion_usuario(usr_id, 6, 2026)
    
    assert liq.monto_base == 200.0
    assert liq.monto_plus == 50.0
    assert liq.monto_total == 250.0

@pytest.mark.asyncio
async def test_cierre_liquidacion_inmutable(db_session, tenant_id):
    service = LiquidacionService(db_session, tenant_id)
    usr_id = uuid4()
    admin_id = uuid4()
    
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="U", apellidos="U", email="u@u.com", dni="2", cuil="2", cbu="2", alias_cbu="2", banco="B", facturador=False)
    db_session.add(usr)
    await db_session.commit()
    
    res = await service.cerrar_liquidacion_mensual(usr_id, 5, 2026, admin_id)
    assert res.estado == EstadoLiquidacion.CERRADA
    
    # Intentar cerrar de nuevo debe fallar
    with pytest.raises(HTTPException):
        await service.cerrar_liquidacion_mensual(usr_id, 5, 2026, admin_id)

@pytest.mark.asyncio
async def test_usuario_facturador_excluido(db_session, tenant_id):
    service = LiquidacionService(db_session, tenant_id)
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="F", apellidos="F", email="f@f.com", dni="3", cuil="3", cbu="3", alias_cbu="3", banco="B", facturador=True)
    fact = Factura(tenant_id=tenant_id, usuario_id=usr_id, periodo_mes=6, periodo_anio=2026, monto=150.0)
    
    db_session.add_all([usr, fact])
    await db_session.commit()
    
    liq = await service.calcular_liquidacion_usuario(usr_id, 6, 2026)
    assert liq.excluido_por_factura == True
