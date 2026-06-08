## ADDED Requirements

### Requirement: Edición de campos permitidos del perfil
El sistema SHALL permitir al usuario autenticado modificar su nombre, apellidos, alias CBU, banco, regional y modalidad_cobro, enviando los nuevos datos al endpoint `PUT /api/perfil/me`.

#### Scenario: Actualización exitosa
- **WHEN** el usuario envía un payload válido con su nuevo banco
- **THEN** el sistema actualiza el registro del usuario y retorna los datos actualizados

### Requirement: Bloqueo de campos sensibles
El sistema SHALL ignorar o rechazar cualquier intento de modificación sobre los campos `dni` y `cuil` a través del endpoint de edición de perfil propio.

#### Scenario: Intento de modificación de DNI
- **WHEN** el usuario incluye `dni` en el payload de actualización
- **THEN** el sistema lo ignora y mantiene el DNI original intacto, o retorna error de validación 422 si se usa `extra='forbid'` en Pydantic.

### Requirement: Registro de auditoría por cambio de perfil
El sistema SHALL registrar un evento en `AuditLog` cada vez que el usuario modifica exitosamente su perfil, indicando los campos modificados.

#### Scenario: Cambio de alias CBU auditado
- **WHEN** el usuario cambia su alias CBU
- **THEN** se genera un registro en auditoría con accion `"PERFIL_MODIFICADO"` especificando en los detalles que el CBU cambió.
