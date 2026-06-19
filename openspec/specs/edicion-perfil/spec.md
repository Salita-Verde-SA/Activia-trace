# edicion-perfil Specification

## Purpose
TBD - created by archiving change c-20-perfil-y-mensajeria-interna. Update Purpose after archive.
## Requirements
### Requirement: Edición de campos permitidos del perfil
El sistema SHALL permitir al usuario autenticado modificar su nombre, apellido, CBU, alias CBU, banco, regional, género, condición frente al impuesto (`es_monotributista`) e identificador profesional, enviando los nuevos datos al endpoint `PUT /api/perfil/me`. Todos los campos nuevos son opcionales.

#### Scenario: Actualización exitosa con campos básicos
- **WHEN** el usuario envía nombre y apellido actualizados
- **THEN** el sistema actualiza el registro y retorna los datos completos incluyendo los nuevos campos

#### Scenario: Actualización de datos bancarios extendidos
- **WHEN** el usuario actualiza banco y regional
- **THEN** el sistema persiste los valores nuevos en las columnas correspondientes del modelo Usuario

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

