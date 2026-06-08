from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
import csv
import io
import logging
from typing import List

from models.padron import VersionPadron, EntradaPadron
from models.user import Usuario
from models.audit import AuditLog
from schemas.padron import VersionPadronCreate, EntradaPadronCreate
from integrations.moodle_ws import MoodleClient
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class PadronService:
    @staticmethod
    async def activar_version(
        db: AsyncSession, 
        tenant_id: UUID, 
        materia_id: UUID, 
        cohorte_id: UUID, 
        nueva_version_id: UUID
    ):
        """
        Activa una nueva versión del padrón y desactiva la anterior.
        """
        await db.execute(
            update(VersionPadron)
            .where(
                VersionPadron.tenant_id == tenant_id,
                VersionPadron.materia_id == materia_id,
                VersionPadron.cohorte_id == cohorte_id,
                VersionPadron.activa == True,
                VersionPadron.deleted_at.is_(None)
            )
            .values(activa=False)
        )
        
        await db.execute(
            update(VersionPadron)
            .where(
                VersionPadron.tenant_id == tenant_id,
                VersionPadron.id == nueva_version_id
            )
            .values(activa=True)
        )

    @staticmethod
    async def crear_version_padron(
        db: AsyncSession,
        tenant_id: UUID,
        actor_id: UUID,
        materia_id: UUID,
        cohorte_id: UUID,
        entradas_data: List[EntradaPadronCreate]
    ) -> VersionPadron:
        
        version = VersionPadron(
            tenant_id=tenant_id,
            materia_id=materia_id,
            cohorte_id=cohorte_id,
            cargado_por=actor_id,
            activa=False
        )
        db.add(version)
        await db.flush()

        emails = [e.email for e in entradas_data]
        if emails:
            result = await db.execute(
                select(Usuario.id, Usuario.email)
                .where(
                    Usuario.tenant_id == tenant_id, 
                    Usuario.deleted_at.is_(None),
                    Usuario.email.in_(emails) # NOTA: si email está encriptado en bd, la búsqueda .in_() puede requerir lógica especial según el `EncryptedString` usado.
                )
            )
            usuario_map = {row.email: row.id for row in result}
        else:
            usuario_map = {}

        entradas = []
        for e_data in entradas_data:
            entrada = EntradaPadron(
                tenant_id=tenant_id,
                version_id=version.id,
                usuario_id=usuario_map.get(e_data.email),
                nombre=e_data.nombre,
                apellidos=e_data.apellidos,
                email=e_data.email,
                comision=e_data.comision,
                regional=e_data.regional
            )
            entradas.append(entrada)
            db.add(entrada)
            
        await db.flush()
        
        await PadronService.activar_version(db, tenant_id, materia_id, cohorte_id, version.id)
        
        audit = AuditLog(
            tenant_id=tenant_id,
            actor_id=actor_id,
            accion="PADRON_CARGAR",
            materia_id=materia_id,
            detalle={"cohorte_id": str(cohorte_id), "version_id": str(version.id), "registros": len(entradas)},
            filas_afectadas=len(entradas) + 1
        )
        db.add(audit)
        
        await db.commit()
        await db.refresh(version)
        return version

    @staticmethod
    async def importar_manual_csv(
        db: AsyncSession,
        tenant_id: UUID,
        actor_id: UUID,
        materia_id: UUID,
        cohorte_id: UUID,
        file_content: bytes
    ) -> VersionPadron:
        content = file_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        
        entradas_data = []
        for row in reader:
            email = row.get("email") or row.get("Email Address")
            nombre = row.get("nombre") or row.get("First Name") or row.get("firstname")
            apellidos = row.get("apellidos") or row.get("Last Name") or row.get("lastname")
            comision = row.get("comision") or row.get("Group")
            regional = row.get("regional")
            
            if email and nombre and apellidos:
                entradas_data.append(EntradaPadronCreate(
                    nombre=nombre,
                    apellidos=apellidos,
                    email=email,
                    comision=comision,
                    regional=regional
                ))
                
        if not entradas_data:
            raise HTTPException(status_code=400, detail="El archivo no contiene registros válidos o faltan columnas (nombre, apellidos, email).")

        return await PadronService.crear_version_padron(
            db, tenant_id, actor_id, materia_id, cohorte_id, entradas_data
        )

    @staticmethod
    async def sincronizar_moodle(
        db: AsyncSession,
        tenant_id: UUID,
        actor_id: UUID,
        materia_id: UUID,
        cohorte_id: UUID,
        moodle_course_id: int,
        moodle_client: MoodleClient
    ) -> VersionPadron:
        
        users_moodle = await moodle_client.fetch_padron(moodle_course_id)
        
        entradas_data = []
        for u in users_moodle:
            email = u.get("email")
            nombre = u.get("firstname")
            apellidos = u.get("lastname")
            
            if email and nombre and apellidos:
                entradas_data.append(EntradaPadronCreate(
                    nombre=nombre,
                    apellidos=apellidos,
                    email=email,
                    comision=None,
                    regional=None
                ))
                
        if not entradas_data:
            raise HTTPException(status_code=400, detail="No se encontraron usuarios válidos en el curso de Moodle.")

        return await PadronService.crear_version_padron(
            db, tenant_id, actor_id, materia_id, cohorte_id, entradas_data
        )

    @staticmethod
    async def vaciar_padron(
        db: AsyncSession,
        tenant_id: UUID,
        actor_id: UUID,
        materia_id: UUID,
        cohorte_id: UUID
    ):
        versiones_result = await db.execute(
            select(VersionPadron.id)
            .where(
                VersionPadron.tenant_id == tenant_id,
                VersionPadron.materia_id == materia_id,
                VersionPadron.cohorte_id == cohorte_id,
                VersionPadron.deleted_at.is_(None)
            )
        )
        v_ids = [row.id for row in versiones_result.scalars()]
        
        if not v_ids:
            return 0
            
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
            
        await db.execute(
            update(VersionPadron)
            .where(VersionPadron.id.in_(v_ids))
            .values(activa=False, deleted_at=now)
        )
        
        await db.execute(
            update(EntradaPadron)
            .where(EntradaPadron.version_id.in_(v_ids))
            .values(deleted_at=now)
        )

        audit = AuditLog(
            tenant_id=tenant_id,
            actor_id=actor_id,
            accion="PADRON_VACIAR",
            materia_id=materia_id,
            detalle={"cohorte_id": str(cohorte_id), "versiones_eliminadas": len(v_ids)},
            filas_afectadas=len(v_ids)
        )
        db.add(audit)
        await db.commit()
        return len(v_ids)
