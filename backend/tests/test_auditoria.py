import pytest
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from models.user import Usuario, RolUsuario, Rol, UsuarioRol, Permiso, RolPermiso
from models.audit import AuditLog
from models.asignacion import Asignacion
from models.padron import InstanciaDictado
from models.estructura import Materia
from services.auditoria import AuditoriaService
from schemas.auditoria import AuditoriaFiltro

@pytest.mark.asyncio
async def test_admin_ve_todo(db_session, tenant_id):
    # Setup usuario Admin
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="A", apellidos="A", email="a@a.com", dni="1", cuil="1", cbu="1", alias_cbu="1", banco="B", facturador=False)
    rol_admin = Rol(id=uuid4(), tenant_id=tenant_id, nombre=RolUsuario.ADMIN, descripcion="Admin")
    usr_rol = UsuarioRol(tenant_id=tenant_id, usuario_id=usr_id, rol_id=rol_admin.id)
    db_session.add_all([usr, rol_admin, usr_rol])
    
    # Audit log de otro usuario
    log = AuditLog(tenant_id=tenant_id, usuario_id=uuid4(), accion="TEST", entidad="Test", entidad_id=uuid4())
    db_session.add(log)
    await db_session.commit()
    await db_session.refresh(usr)
    
    service = AuditoriaService(db_session, tenant_id, usr)
    res = await service.obtener_ultimas_acciones()
    assert res.total >= 1
    assert any(item.accion == "TEST" for item in res.items)

@pytest.mark.asyncio
async def test_coordinador_ve_su_scope(db_session, tenant_id):
    # Setup usuario Coordinador
    coord_id = uuid4()
    coord = Usuario(id=coord_id, tenant_id=tenant_id, nombre="C", apellidos="C", email="c@c.com", dni="2", cuil="2", cbu="2", alias_cbu="2", banco="B", facturador=False)
    rol_coord = Rol(id=uuid4(), tenant_id=tenant_id, nombre=RolUsuario.COORDINADOR, descripcion="Coord")
    usr_rol = UsuarioRol(tenant_id=tenant_id, usuario_id=coord_id, rol_id=rol_coord.id)
    
    # Materia y Asignacion (El coord coordina esta instancia)
    mat = Materia(id=uuid4(), tenant_id=tenant_id, codigo="M", nombre="M")
    inst = InstanciaDictado(id=uuid4(), tenant_id=tenant_id, materia_id=mat.id, nombre="Com", anio=2026, cuatrimestre=1)
    asig_coord = Asignacion(id=uuid4(), tenant_id=tenant_id, usuario_id=coord_id, rol=RolUsuario.COORDINADOR, instancia_dictado_id=inst.id)
    
    # Docente en esa instancia
    doc_id = uuid4()
    asig_doc = Asignacion(id=uuid4(), tenant_id=tenant_id, usuario_id=doc_id, rol=RolUsuario.PROFESOR, instancia_dictado_id=inst.id)
    
    # Docente en otra instancia (fuera de scope)
    doc2_id = uuid4()
    inst2 = InstanciaDictado(id=uuid4(), tenant_id=tenant_id, materia_id=mat.id, nombre="Com 2", anio=2026, cuatrimestre=1)
    asig_doc2 = Asignacion(id=uuid4(), tenant_id=tenant_id, usuario_id=doc2_id, rol=RolUsuario.PROFESOR, instancia_dictado_id=inst2.id)

    db_session.add_all([coord, rol_coord, usr_rol, mat, inst, inst2, asig_coord, asig_doc, asig_doc2])
    
    # Logs
    log_doc_in_scope = AuditLog(tenant_id=tenant_id, usuario_id=doc_id, accion="IN_SCOPE")
    log_doc_out_scope = AuditLog(tenant_id=tenant_id, usuario_id=doc2_id, accion="OUT_SCOPE")
    db_session.add_all([log_doc_in_scope, log_doc_out_scope])
    
    await db_session.commit()
    await db_session.refresh(coord)
    
    service = AuditoriaService(db_session, tenant_id, coord)
    res = await service.obtener_ultimas_acciones()
    
    acciones = [item.accion for item in res.items]
    assert "IN_SCOPE" in acciones
    assert "OUT_SCOPE" not in acciones

@pytest.mark.asyncio
async def test_explorar_logs_filtros(db_session, tenant_id):
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="A", apellidos="A", email="x@x.com", dni="9", cuil="9", cbu="9", alias_cbu="9", banco="B", facturador=False)
    rol_admin = Rol(id=uuid4(), tenant_id=tenant_id, nombre=RolUsuario.ADMIN, descripcion="Admin")
    usr_rol = UsuarioRol(tenant_id=tenant_id, usuario_id=usr_id, rol_id=rol_admin.id)
    db_session.add_all([usr, rol_admin, usr_rol])
    
    log1 = AuditLog(tenant_id=tenant_id, usuario_id=usr_id, accion="TEST_A")
    log2 = AuditLog(tenant_id=tenant_id, usuario_id=usr_id, accion="TEST_B")
    db_session.add_all([log1, log2])
    await db_session.commit()
    await db_session.refresh(usr)
    
    service = AuditoriaService(db_session, tenant_id, usr)
    
    filtro = AuditoriaFiltro(accion="TEST_A")
    res = await service.explorar_logs(filtro)
    assert res.total == 1
    assert res.items[0].accion == "TEST_A"

    # Limit offset
    filtro2 = AuditoriaFiltro(limit=1, offset=1)
    res2 = await service.explorar_logs(filtro2)
    # Total es 2 (al menos), pero items debe ser 1
    assert len(res2.items) == 1
