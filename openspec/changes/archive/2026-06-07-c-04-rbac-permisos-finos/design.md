## Context

Activia-trace maneja múltiples roles, algunos superpuestos y dinámicos (ALUMNO, TUTOR, PROFESOR, COORDINADOR, NEXO, ADMIN, FINANZAS). Los permisos en los endpoints no pueden estar atados fuertemente (hardcoded) a nombres de roles, sino a permisos específicos con la sintaxis `modulo:accion`. De esta forma, si el rol NEXO cambia sus responsabilidades, solo se ajusta la base de datos sin necesidad de recompilar la aplicación.

## Goals / Non-Goals

**Goals:**
- Diseño de tablas administrables: `Rol`, `Permiso`, y `RolPermiso`.
- Evaluación de permisos server-side para cada petición, uniendo todos los permisos de todos los roles vigentes del usuario en el tenant actual.
- Falla segura (Fail-Closed): Todo endpoint sin protección explícita deniega el acceso, o el middleware fuerza a que se declare un permiso.

**Non-Goals:**
- No implementaremos ABM completo (CRUD) de estos catálogos de roles/permisos ahora, solo la infraestructura de BD y la carga inicial (Seed) de los mismos (Alembic).

## Decisions

1. **Dependencia `require_permission(modulo:accion)`**:
   Se creará una factoría de dependencias en FastAPI que extraerá el token, resolverá la identidad e interrogará a la base de datos (o a un caché de sesión que luego implementaremos) para verificar que el usuario tenga ese permiso específico en ese tenant.

2. **Formato de Permisos (`modulo:accion`)**:
   Los permisos siempre llevarán este formato unificado para facilitar parsing y lógica de dominio (ej. `materia:lectura`, `calificacion:crear`).

3. **Carga Inicial por Migración**:
   La migración `002_rbac_permisos_finos` contendrá el seed data base dictado por la KB `03_actores_y_roles.md`, insertando la matriz canónica para arrancar el sistema con permisos operativos.

## Risks / Trade-offs

- [Risk] Múltiples consultas a base de datos por request para resolver permisos. → **Mitigación**: A corto plazo, indexar correctamente la tabla intermedia y usar `selectinload`. A medio plazo (futuro), guardar en Redis o en el payload del JWT los roles/permisos asumiendo expiraciones cortas (15m).
