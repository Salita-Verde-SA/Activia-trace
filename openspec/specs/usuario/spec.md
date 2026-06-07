# usuario Specification

## Purpose
TBD - created by archiving change c-07-usuarios-y-asignaciones. Update Purpose after archive.
## Requirements
### Requirement: Registro de Usuario con PII cifrada
El sistema DEBE permitir la creación de registros de `Usuario`. Los datos que constituyen PII (como email, DNI, CUIL, CBU y alias de CBU) DEBEN estar cifrados en reposo utilizando AES-256. El legajo es un dato de negocio opcional.

#### Scenario: Creación exitosa de un usuario
- **WHEN** un administrador intenta crear un nuevo usuario enviando sus datos personales (email, DNI)
- **THEN** el sistema persiste el usuario en la base de datos cifrando los datos PII antes de escribirlos

### Requirement: Unicidad de usuarios por tenant
El sistema DEBE garantizar que el correo electrónico (email) sea único dentro del contexto de cada `tenant_id`.

#### Scenario: Creación de usuario duplicado
- **WHEN** se intenta crear un usuario con un email que ya existe en el mismo tenant
- **THEN** el sistema rechaza la operación con un error de conflicto (HTTP 409)

### Requirement: Gestión de usuarios
El sistema DEBE proveer endpoints CRUD protegidos bajo `/api/admin/usuarios` para listar, ver, actualizar e inactivar usuarios.

#### Scenario: Listado de usuarios por administrador
- **WHEN** un usuario con permisos de administración de usuarios hace un GET a `/api/admin/usuarios`
- **THEN** el sistema devuelve la lista de usuarios del tenant con sus datos básicos (descifrados en memoria para la respuesta)

