# endpoint-authorization Specification

## Purpose
TBD - created by archiving change c-04-rbac-permisos-finos. Update Purpose after archive.
## Requirements
### Requirement: Fine-grained Endpoint Authorization
El sistema DEBE proteger todos los endpoints restringidos usando la directiva de permiso `modulo:accion`.

#### Scenario: Successful authorization
- **WHEN** un usuario con el permiso `calificaciones:escritura` accede a `POST /api/calificaciones` protegido con `require_permission("calificaciones:escritura")`
- **THEN** el endpoint procesa la solicitud exitosamente.

#### Scenario: Denied authorization
- **WHEN** un usuario sin el permiso requerido accede al endpoint
- **THEN** el sistema responde con un status HTTP 403 Forbidden y detiene la ejecución.

### Requirement: Fail-closed policy
Cualquier endpoint que carezca de la dependencia de validación de permisos DEBE (por middleware u omisión) denegar accesos que muten información, garantizando un principio de menor privilegio.

#### Scenario: Access to unprotected resource
- **WHEN** un desarrollador olvida agregar `require_permission` a una ruta sensible
- **THEN** la ruta es detectada en los tests o el middleware la bloquea previniendo el acceso.

