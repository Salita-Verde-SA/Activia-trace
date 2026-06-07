## 1. Definición de Modelos (RBAC)

- [x] 1.1 Crear el modelo `Rol` en `backend/models/rbac.py` con campos `id`, `nombre` (ej. ALUMNO, ADMIN), y heredar del Mixin de Tenant o base según aplique.
- [x] 1.2 Crear el modelo `Permiso` en `backend/models/rbac.py` con campos `id`, `nombre` (`modulo:accion`).
- [x] 1.3 Crear el modelo intermedio `RolPermiso` para la relación M:N entre `Rol` y `Permiso`.

## 2. Migración y Seed Data

- [x] 2.1 Generar migración vacía con Alembic (`alembic revision -m "002_rbac_permisos_finos"`).
- [x] 2.2 Escribir en la migración la creación de las tablas `roles`, `permisos` y `roles_permisos`.
- [x] 2.3 Incluir en la migración (o script de seed) la inserción de los roles canónicos (ALUMNO, TUTOR, PROFESOR, COORDINADOR, NEXO, ADMIN, FINANZAS) y los permisos base de acuerdo a `03_actores_y_roles.md`.

## 3. Autorización de Endpoints (Dependency)

- [x] 3.1 Implementar la función de dependencia `require_permission(permiso: str)` en `backend/api/dependencies/auth.py`.
- [x] 3.2 Modificar `require_permission` para que, tras validar el JWT mediante `get_current_user`, cruce los roles del usuario con los permisos requeridos devolviendo 403 Forbidden si no aplica.

## 4. Tests y Validación

- [x] 4.1 Crear `backend/tests/test_rbac_models.py` para verificar que la matriz de roles y permisos se almacena correctamente en base de datos.
- [x] 4.2 Crear test unitario/integración para la dependencia `require_permission`, probando un usuario con permisos válidos (200 OK) y otro sin permisos (403 Forbidden).
- [x] 4.3 Asegurar que los tests respeten el `NullPool` y la limpieza limpia (sin DB mocks).
