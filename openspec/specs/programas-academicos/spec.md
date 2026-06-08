# programas-academicos Specification

## Purpose
TBD - created by archiving change c-17-programas-y-fechas-academicas. Update Purpose after archive.
## Requirements
### Requirement: CRUD de Programas Académicos
El sistema SHALL permitir la carga, modificación y eliminación lógica de programas de materia asociados a una Materia, Carrera y Cohorte (si aplica).

#### Scenario: Carga exitosa de un programa
- **WHEN** un usuario con permiso `estructura:gestionar` envía un documento con los identificadores correctos.
- **THEN** el sistema guarda el registro de ProgramaMateria, almacena la referencia del archivo y devuelve un status 201.

#### Scenario: Falla por falta de permisos
- **WHEN** un usuario sin permiso `estructura:gestionar` intenta subir un programa.
- **THEN** el sistema rechaza la operación con código 403 Forbidden.

#### Scenario: Consulta de programa por materia
- **WHEN** un usuario consulta los programas de una materia para un tenant específico.
- **THEN** el sistema devuelve la lista de programas asociados con sus referencias de descarga, ocultando aquellos marcados como borrados.

