## Why

El sistema requiere un control de acceso granular (Role-Based Access Control) multi-tenant donde los permisos no estén hardcodeados (como simples flags), sino que puedan evolucionar como datos administrables en base de datos. Esto es fundamental para asegurar que todo endpoint esté protegido explícitamente según el principio de menor privilegio (fail-closed por defecto).

## What Changes

- Creación de las entidades `Rol`, `Permiso` y la tabla intermedia `RolPermiso` (para definir la matriz de permisos).
- Se realizará la carga de datos iniciales (Seed) de los roles canónicos de negocio: `ALUMNO`, `TUTOR`, `PROFESOR`, `COORDINADOR`, `NEXO`, `ADMIN`, `FINANZAS`.
- Los permisos tendrán la sintaxis de dominio `modulo:accion` (ej. `calificaciones:lectura`).
- Implementación de un inyector de dependencia (`require_permission`) para validar los permisos efectivos de un usuario por cada request a nivel de endpoint.

## Capabilities

### New Capabilities
- `rbac-core`: Definición de la matriz administrable de roles y permisos.
- `endpoint-authorization`: Resolución en tiempo de ejecución de la autorización (`modulo:accion`), resultando en 403 Forbidden cuando el token provisto no cuenta con los permisos necesarios.

### Modified Capabilities
- N/A

## Impact

- Todo endpoint actual y futuro requerirá el inyector `require_permission` acoplado a la dependencia `get_current_user`.
- Requerirá una nueva migración Alembic (`002`) para las tablas y la carga inicial (seed) de roles.
- Las consultas a la matriz de permisos deberán ser altamente eficientes para evitar penalidades de latencia en cada request autenticada.
