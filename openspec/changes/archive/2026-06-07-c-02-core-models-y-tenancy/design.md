## Context

activia-trace es un SaaS multi-tenant que exige aislamiento estricto de datos por institución (Tenant). La seguridad de la información personal (PII) debe estar cifrada en reposo mediante AES-256 y todo registro eliminado debe conservar su historial a través de un soft delete. Este documento detalla la implementación técnica de la base del dominio, estableciendo los patrones que usarán todos los módulos subsiguientes.

## Goals / Non-Goals

**Goals:**
- Proveer la clase base declarativa de SQLAlchemy con convenciones de nombres.
- Implementar mixins reutilizables: `TenantMixin`, `SoftDeleteMixin` y `TimestampMixin`.
- Implementar el repositorio genérico (`BaseRepository`) que aplique filtrado automático por `tenant_id` y respete el `SoftDeleteMixin`.
- Implementar la primera migración de esquema (`001_tenant`).
- Proveer utilidad de cifrado/descifrado transparente para PII (DNI, CBU, email).

**Non-Goals:**
- No se implementarán las entidades finales del dominio (Usuarios, Materias, etc.), solo la infraestructura base.
- No se aborda la autenticación JWT o autorización RBAC (eso corresponde a C-03 y C-04).

## Decisions

1. **Aislamiento de Tenant en Repositorios (ADR-002)**
   - *Decisión*: El `BaseRepository` requerirá obligatoriamente `tenant_id` en su instanciación. Todos los métodos base (`get`, `list`, `create`, `update`, `delete`) inyectarán `.where(Model.tenant_id == self.tenant_id)` de forma imperativa.
   - *Racional*: Es más seguro que forzar a cada Service a pasar el `tenant_id` por parámetro, centralizando la regla de negocio y previniendo fugas.

2. **Soft Delete Transversal**
   - *Decisión*: El método `delete()` del `BaseRepository` ejecutará un `UPDATE` seteando la columna `deleted_at = func.now()` provista por el `SoftDeleteMixin`. Todas las lecturas inyectarán `.where(Model.deleted_at.is_(None))`.
   - *Racional*: Preserva el historial para la auditoría (E-AUD) y permite "deshacer" acciones u observar datos pasados.

3. **Cifrado AES-256 Transparente**
   - *Decisión*: Utilizar un `TypeDecorator` personalizado de SQLAlchemy (`EncryptedString`) que usa `cryptography.fernet` (que implementa AES en modo CBC/CTR internamente) con la `ENCRYPTION_KEY` del entorno.
   - *Racional*: El cifrado/descifrado ocurre en la capa del ORM de manera transparente. La base de datos solo ve el ciphertext, y los Services/Routers solo ven el texto plano. 

4. **Identificador Global Uniforme (UUID)**
   - *Decisión*: Todas las entidades usarán `UUID` versión 4 como `id` primario, generado automáticamente a nivel de la base de datos o aplicación.

## Risks / Trade-offs

- **[Risk] Rendimiento por TypeDecorator de cifrado** → *Mitigación*: Fernet es simétrico y extremadamente rápido. Solo se aplicará a columnas estrictamente marcadas como `[cifrado]` (PII).
- **[Risk] Olvido del scope de tenant en queries complejas customizadas** → *Mitigación*: Las consultas customizadas en subclases del repositorio deben usar un método base `self._base_query()` que ya traiga pre-aplicados los filtros de `tenant_id` y `deleted_at`.
