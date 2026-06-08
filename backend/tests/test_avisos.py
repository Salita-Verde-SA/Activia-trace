import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from models.avisos import Aviso, AcknowledgmentAviso, AlcanceAviso, SeveridadAviso
from models.user import Usuario
from models.asignacion import Asignacion
from schemas.aviso import AvisoCreate, AvisoAcknowledgmentCreate
from services.avisos import AvisoService

@pytest.mark.asyncio
async def test_crear_aviso(db_session, tenant_id):
    service = AvisoService(db_session, tenant_id)
    data = AvisoCreate(
        titulo="Prueba",
        cuerpo="Prueba cuerpo",
        severidad=SeveridadAviso.INFO,
        fecha_inicio=datetime.now(timezone.utc),
        alcance=AlcanceAviso.GLOBAL
    )
    aviso = await service.crear_aviso(data)
    assert aviso.id is not None
    assert aviso.titulo == "Prueba"
    assert aviso.alcance == AlcanceAviso.GLOBAL

@pytest.mark.asyncio
async def test_listar_y_ack_avisos(db_session, tenant_id):
    service = AvisoService(db_session, tenant_id)
    usuario_id = uuid4()
    materia_id = uuid4()

    usr = Usuario(
        id=usuario_id, tenant_id=tenant_id, nombre="T", apellidos="T",
        email="t@t.com", dni="1", cuil="1", cbu="1", alias_cbu="1", banco="B", facturador=False
    )
    db_session.add(usr)
    
    # Asignacion
    asig = Asignacion(
        id=uuid4(), tenant_id=tenant_id, usuario_id=usuario_id, rol_id=uuid4(), materia_id=materia_id,
        desde=datetime.now(timezone.utc) - timedelta(days=1)
    )
    db_session.add(asig)

    # Aviso global sin ack
    aviso1 = Aviso(id=uuid4(), tenant_id=tenant_id, titulo="A1", cuerpo="C1", 
                   alcance=AlcanceAviso.GLOBAL, requiere_ack=False, fecha_inicio=datetime.now(timezone.utc))
    db_session.add(aviso1)

    # Aviso materia con ack
    aviso2 = Aviso(id=uuid4(), tenant_id=tenant_id, titulo="A2", cuerpo="C2",
                   alcance=AlcanceAviso.MATERIA, materia_id=materia_id, requiere_ack=True, fecha_inicio=datetime.now(timezone.utc))
    db_session.add(aviso2)

    await db_session.commit()

    # Listar activos (debe traer los dos)
    avisos_pendientes = await service.listar_activos_para_usuario(usuario_id)
    assert len(avisos_pendientes) == 2

    # Hacer ack de aviso2
    await service.registrar_acuse_recibo(usuario_id, AvisoAcknowledgmentCreate(aviso_id=aviso2.id))

    # Listar activos de nuevo (debe traer solo aviso1)
    avisos_pendientes_after = await service.listar_activos_para_usuario(usuario_id)
    assert len(avisos_pendientes_after) == 1
    assert avisos_pendientes_after[0].id == aviso1.id

@pytest.mark.asyncio
async def test_metricas_aviso(db_session, tenant_id):
    service = AvisoService(db_session, tenant_id)
    usuario_id = uuid4()

    usr = Usuario(
        id=usuario_id, tenant_id=tenant_id, nombre="T2", apellidos="T2",
        email="t2@t.com", dni="2", cuil="2", cbu="2", alias_cbu="2", banco="B", facturador=False
    )
    db_session.add(usr)

    aviso = Aviso(id=uuid4(), tenant_id=tenant_id, titulo="AGlobal", cuerpo="C", 
                   alcance=AlcanceAviso.GLOBAL, requiere_ack=True, fecha_inicio=datetime.now(timezone.utc))
    db_session.add(aviso)
    await db_session.commit()

    # Antes de ack, 1 total (usr), 0 ack
    metricas1 = await service.obtener_metricas_aviso(aviso.id)
    # Total de usrs en DB de test puede variar según otros tests que usen el mismo fixture si no limpian, 
    # pero suponiendo que el total_alcance es >= 1
    assert metricas1.leidos_count == 0
    
    await service.registrar_acuse_recibo(usuario_id, AvisoAcknowledgmentCreate(aviso_id=aviso.id))
    
    metricas2 = await service.obtener_metricas_aviso(aviso.id)
    assert metricas2.leidos_count == 1
