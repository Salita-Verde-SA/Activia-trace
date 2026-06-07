## Why

activia-trace es una plataforma SaaS multi-institución por diseño, no por adición tardía (ADR-002). Toda la arquitectura de seguridad, aislamiento de datos y modelo de dominio depende de que la base de la persistencia entienda el concepto de "Tenant" (institución) de forma nativa. Este cambio implementa la fundación de la capa de persistencia: el modelo Tenant, el mecanismo de soft-delete, el aislamiento a nivel de base de datos (row-level security lógica mediante SQLAlchemy) y las herramientas base de criptografía para proteger la información personal identificable (PII).

## What Changes

- Creación de la entidad raíz `Tenant` (modelo SQLAlchemy).
- Implementación de un mixin base para modelos (`TimestampMixin`, `SoftDeleteMixin`, `TenantMixin`).
- Implementación de un repositorio base (`BaseRepository`) genérico que aplique filtrado automático por `tenant_id` y respete el soft delete en todas las consultas.
- Desarrollo de utilidad criptográfica estandarizada (AES-256) para atributos marcados como `[cifrado]` (DNI, CBU, email).
- Configuración de la primera migración de esquema en Alembic (`001_tenant`).

## Capabilities

### New Capabilities
- `tenant-isolation`: Aislamiento transversal de datos por institución, asegurando que las consultas y operaciones se restringen automáticamente al tenant en curso.
- `soft-delete-mechanism`: Mecanismo que previene el borrado físico de registros de base de datos para preservar el rastro de auditoría, marcándolos como inactivos en su lugar.
- `pii-encryption`: Utilidad transversal de cifrado AES-256 en reposo para atributos sensibles, evitando fugas de información personal en logs o dumps de base de datos.
- `base-repository-pattern`: Patrón de acceso a datos estandarizado que fuerza la aplicación de reglas de negocio globales (tenant, soft-delete) de manera transparente para las capas superiores.

### Modified Capabilities
<!-- No requirement changes to existing specs, as this is foundational. -->

## Impact

- **Modelos**: Establece la clase base declarativa de SQLAlchemy de la cual heredarán todas las entidades futuras del dominio.
- **Repositories**: Todas las consultas a la base de datos se canalizarán a través del patrón repositorio definido aquí, forzando la inyección del `tenant_id`.
- **Configuración**: Se requieren y validan claves criptográficas en el entorno (`ENCRYPTION_KEY` de 32 bytes).
- **Tests**: Se establecen las bases y utilidades de testing para asegurar que las pruebas fallan si se cruzan datos entre tenants de forma inesperada.
