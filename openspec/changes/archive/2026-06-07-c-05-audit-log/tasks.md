## 1. Data Model & Migrations

- [x] 1.1 Crear el modelo `AuditLog` en `backend/models/audit.py` sin heredar de `SoftDeleteMixin`, garantizando que solo tenga `created_at` (o `fecha_hora`). Incluir campos requeridos (`actor_id`, `impersonado_id`, `tenant_id`, `materia_id`, `accion`, `detalle`, `filas_afectadas`, `ip`, `user_agent`).
- [x] 1.2 Importar el modelo en `backend/models/__init__.py`.
- [x] 1.3 Generar migración vacía (`alembic revision --autogenerate -m "003_audit_log"`).
- [x] 1.4 Editar la migración autogenerada para incluir la función y el trigger de PostgreSQL que bloquean explícitamente operaciones `UPDATE` y `DELETE` sobre la tabla `audit_log`.

## 2. JWT & Impersonation Handling

- [x] 2.1 Modificar la estructura `CurrentUser` en `backend/api/dependencies/auth.py` para incluir `impersonator_id` (opcional).
- [x] 2.2 Modificar `get_current_user` para extraer `impersonator_id` del payload del JWT.
- [x] 2.3 Implementar endpoint de suplantación (ej. `POST /api/auth/impersonate`) protegido por el permiso `impersonacion:usar` que emita un nuevo JWT con el `sub` del target y el `impersonator_id` del actor real.

## 3. Audit Logger Dependency

- [x] 3.1 Crear `backend/core/audit.py` o servicio equivalente con un inyector de dependencias (o función) que permita registrar eventos estandarizados. Debe usar `Request` para extraer IP y User-Agent, y `CurrentUser` para extraer la identidad real.

## 4. Testing

- [x] 4.1 Escribir tests E2E que intenten ejecutar un UPDATE y un DELETE sobre un registro de `AuditLog` directamente en la DB y verifiquen que el trigger lance un `IntegrityError` o equivalente.
- [x] 4.2 Escribir test validando que un usuario con `impersonacion:usar` puede generar un token de impersonación válido.
- [x] 4.3 Escribir test validando que un evento auditado bajo impersonación registra correctamente el `actor_id` (impersonador) y el `impersonado_id` (target).
