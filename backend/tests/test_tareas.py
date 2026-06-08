import pytest
from uuid import uuid4
from fastapi import HTTPException
from models.tareas import Tarea, ComentarioTarea, EstadoTarea, PrioridadTarea
from models.user import Usuario
from schemas.tarea import TareaCreate, TareaUpdateEstado, ComentarioTareaCreate
from services.tareas import TareaService

@pytest.mark.asyncio
async def test_crear_tarea(db_session, tenant_id):
    service = TareaService(db_session, tenant_id)
    
    asignado_por = uuid4()
    asignado_a = uuid4()
    
    usr1 = Usuario(id=asignado_por, tenant_id=tenant_id, nombre="A", apellidos="A", email="a@a.com", dni="1", cuil="1", cbu="1", alias_cbu="1", banco="B", facturador=False)
    usr2 = Usuario(id=asignado_a, tenant_id=tenant_id, nombre="B", apellidos="B", email="b@b.com", dni="2", cuil="2", cbu="2", alias_cbu="2", banco="B", facturador=False)
    
    db_session.add_all([usr1, usr2])
    await db_session.commit()

    data = TareaCreate(
        titulo="Test tarea",
        descripcion="Desc",
        prioridad=PrioridadTarea.HIGH,
        asignado_a=asignado_a
    )
    
    tarea = await service.crear_tarea(asignado_por, data)
    assert tarea.id is not None
    assert tarea.titulo == "Test tarea"
    assert tarea.estado == EstadoTarea.PENDIENTE
    assert tarea.asignado_a == asignado_a
    assert tarea.asignado_por == asignado_por

@pytest.mark.asyncio
async def test_transicion_estado_y_comentarios(db_session, tenant_id):
    service = TareaService(db_session, tenant_id)
    
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="C", apellidos="C", email="c@c.com", dni="3", cuil="3", cbu="3", alias_cbu="3", banco="B", facturador=False)
    db_session.add(usr)
    await db_session.commit()
    
    tarea_data = TareaCreate(titulo="T", asignado_a=usr_id)
    tarea = await service.crear_tarea(usr_id, tarea_data)
    
    # Agregar comentario suelto
    await service.agregar_comentario(usr_id, tarea.id, ComentarioTareaCreate(texto="Comentario 1"))
    
    # Cambiar estado con comentario
    tarea_updated = await service.cambiar_estado(usr_id, tarea.id, TareaUpdateEstado(estado=EstadoTarea.RESUELTA, comentario="Resuelta ok"))
    
    assert tarea_updated.estado == EstadoTarea.RESUELTA
    assert len(tarea_updated.comentarios) == 2
    assert tarea_updated.comentarios[1].texto == "Resuelta ok"

@pytest.mark.asyncio
async def test_filtros_globales(db_session, tenant_id):
    service = TareaService(db_session, tenant_id)
    
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="D", apellidos="D", email="d@d.com", dni="4", cuil="4", cbu="4", alias_cbu="4", banco="B", facturador=False)
    db_session.add(usr)
    await db_session.commit()
    
    t1 = await service.crear_tarea(usr_id, TareaCreate(titulo="T1", asignado_a=usr_id))
    t2 = await service.crear_tarea(usr_id, TareaCreate(titulo="T2", asignado_a=usr_id))
    
    await service.cambiar_estado(usr_id, t1.id, TareaUpdateEstado(estado=EstadoTarea.EN_PROGRESO))
    
    res1 = await service.listar_globales(estado=EstadoTarea.EN_PROGRESO)
    assert len(res1) == 1
    assert res1[0].id == t1.id
    
    res2 = await service.listar_globales(asignado_a=usr_id)
    assert len(res2) == 2
