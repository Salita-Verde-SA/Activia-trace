import pytest
from uuid import uuid4
from fastapi import HTTPException

from models.user import Usuario
from services.usuario import UsuarioService
from services.mensajeria_interna import MensajeriaInternoService
from schemas.usuario import UsuarioPerfilUpdate
from schemas.mensajeria_interna import HiloCreate, MensajeInternoCreate
from models.audit import AuditLog

@pytest.mark.asyncio
async def test_editar_perfil(db_session, tenant_id):
    usr_id = uuid4()
    usr = Usuario(id=usr_id, tenant_id=tenant_id, nombre="A", apellidos="A", email="a@a.com", dni="1", cuil="1", banco="B", facturador=False)
    db_session.add(usr)
    await db_session.commit()
    await db_session.refresh(usr)
    
    service = UsuarioService(db_session, str(tenant_id))
    
    # Intenta actualizar banco y alias_cbu (DNI y CUIL no están en el esquema)
    update_data = UsuarioPerfilUpdate(banco="Nuevo Banco", alias_cbu="mi.alias")
    usr_updated = await service.actualizar_perfil(usr_id, update_data)
    
    assert usr_updated.banco == "Nuevo Banco"
    assert usr_updated.alias_cbu == "mi.alias"
    
    # Verifica que se creó el AuditLog
    from sqlalchemy.future import select
    log = (await db_session.execute(select(AuditLog).where(AuditLog.usuario_id == usr_id, AuditLog.accion == "PERFIL_MODIFICADO"))).scalar_one_or_none()
    assert log is not None
    assert "banco" in log.detalles["campos_modificados"]

@pytest.mark.asyncio
async def test_flujo_mensajeria_interna(db_session, tenant_id):
    u1_id = uuid4()
    u2_id = uuid4()
    u3_id = uuid4() # Usuario no participante
    u1 = Usuario(id=u1_id, tenant_id=tenant_id, nombre="U1", apellidos="U1", email="1@1.com", dni="11", cuil="11", banco="B", facturador=False)
    u2 = Usuario(id=u2_id, tenant_id=tenant_id, nombre="U2", apellidos="U2", email="2@2.com", dni="22", cuil="22", banco="B", facturador=False)
    u3 = Usuario(id=u3_id, tenant_id=tenant_id, nombre="U3", apellidos="U3", email="3@3.com", dni="33", cuil="33", banco="B", facturador=False)
    db_session.add_all([u1, u2, u3])
    await db_session.commit()
    
    service_u1 = MensajeriaInternoService(db_session, tenant_id, u1)
    
    # 1. Iniciar hilo
    hilo_data = HiloCreate(asunto="Test Asunto", mensaje_inicial="Hola U2", destinatarios_ids=[u2_id])
    hilo_res = await service_u1.iniciar_hilo(hilo_data)
    assert hilo_res.asunto == "Test Asunto"
    assert len(hilo_res.mensajes) == 1
    assert hilo_res.mensajes[0].leido == True # Creador lo lee por defecto
    
    # 2. Listar inbox U2 (debería tener 1 hilo con 1 no leido)
    service_u2 = MensajeriaInternoService(db_session, tenant_id, u2)
    inbox_u2 = await service_u2.listar_bandeja_entrada()
    assert len(inbox_u2) == 1
    assert inbox_u2[0].no_leidos_count == 1
    
    # Conteo global U2
    no_leidos_u2 = await service_u2.contar_no_leidos_global()
    assert no_leidos_u2 == 1
    
    # 3. Obtener hilo (lo marca como leído)
    hilo_u2 = await service_u2.obtener_mensajes_hilo(hilo_res.id)
    assert len(hilo_u2.mensajes) == 1
    
    no_leidos_u2_after = await service_u2.contar_no_leidos_global()
    assert no_leidos_u2_after == 0
    
    # 4. Responder
    msg_res = await service_u2.responder_hilo(hilo_res.id, MensajeInternoCreate(contenido="Hola U1"))
    assert msg_res.contenido == "Hola U1"
    
    # Conteo global U1 ahora debe ser 1
    no_leidos_u1 = await service_u1.contar_no_leidos_global()
    assert no_leidos_u1 == 1
    
    # 5. U3 intenta acceder al hilo
    service_u3 = MensajeriaInternoService(db_session, tenant_id, u3)
    with pytest.raises(HTTPException) as exc:
        await service_u3.obtener_mensajes_hilo(hilo_res.id)
    assert exc.value.status_code == 403
