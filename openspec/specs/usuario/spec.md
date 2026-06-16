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

### Requirement: Comunicación API de Usuarios
El frontend SHALL comunicarse con los endpoints de usuarios previniendo redirecciones innecesarias y el backend SHALL aceptar payloads desacoplados de la identidad del tenant.

#### Scenario: Listado de usuarios
- **WHEN** el frontend solicita el listado de usuarios
- **THEN** la petición se realiza a `/api/usuarios/` (con trailing slash) para evitar un HTTP 307 Redirect que descarta el token de autorización.

#### Scenario: Creación de usuario por Admin
- **WHEN** el administrador envía el formulario de nuevo usuario sin especificar contraseña ni tenant
- **THEN** el backend asume el `tenant_id` del administrador, auto-genera una contraseña segura, y responde con código 201 Created.

### Requirement: Actualización de Roles de Usuario
El backend SHALL permitir la actualización de la lista de roles globales para un usuario a través del mismo endpoint de actualización de perfil (`PATCH /api/usuarios/{id}`).

#### Scenario: Administrador asigna nuevos roles
- **GIVEN** que existe un usuario sin roles asignados
- **WHEN** se envía un PATCH con `{"roles": ["ALUMNO", "FINANZAS"]}`
- **THEN** el sistema remueve todos los roles anteriores del usuario (si los hubiera)
- **AND** asigna las asociaciones correctas en la tabla `UsuarioRol` consultando los `rol_id` en el contexto del `tenant` actual.
- **AND** retorna código `200 OK` con la información del usuario actualizada.

