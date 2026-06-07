## 1. Mixins y Entidad Raíz

- [x] 1.1 Crear `backend/app/models/mixins.py` con `TimestampMixin`, `SoftDeleteMixin` y `TenantMixin`.
- [x] 1.2 Crear `backend/app/models/tenant.py` con la entidad `Tenant` (hereda de `TimestampMixin` y `SoftDeleteMixin`).
- [x] 1.3 Crear `backend/app/models/base.py` configurado con la metadata de SQLAlchemy y las convenciones de nombrado.

## 2. Utilidad de Cifrado (AES-256)

- [x] 2.1 Modificar `backend/app/core/security.py` para incluir una clase `EncryptedString` (TypeDecorator de SQLAlchemy) usando `cryptography.fernet` y `ENCRYPTION_KEY`.
- [x] 2.2 Escribir un test unitario (`tests/test_security.py`) validando el cifrado y descifrado correcto.

## 3. Repository Pattern Genérico

- [x] 3.1 Crear `backend/app/repositories/base.py` con la clase `BaseRepository[ModelType]`.
- [x] 3.2 Implementar inicialización forzando `tenant_id` y `session`.
- [x] 3.3 Implementar `_base_query()` que aplique `tenant_id` y filter `deleted_at IS NULL`.
- [x] 3.4 Implementar métodos CRUD (`get`, `list`, `create`, `update`, `delete`) utilizando `_base_query()`. El `delete()` debe hacer soft delete actualizando `deleted_at`.

## 4. Pruebas y Migración

- [x] 4.1 Generar migración inicial Alembic (`alembic revision --autogenerate -m "001_tenant_and_mixins"`).
- [x] 4.2 Escribir tests de integración en `tests/test_repository_base.py` para validar aislamiento multi-tenant (Tenant A no ve datos de Tenant B).
- [x] 4.3 Escribir tests para validar que el soft delete se aplica correctamente y oculta el registro en consultas subsecuentes.
