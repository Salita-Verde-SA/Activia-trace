# admin-global-tareas Specification

## Purpose
TBD - created by archiving change c-16-tareas-internas. Update Purpose after archive.
## Requirements
### Requirement: Panel administrativo de tareas globales
El sistema SHALL proveer una vista global de las tareas del tenant para usuarios con el permiso adecuado (`tareas:gestionar`). 

#### Scenario: Filtrado global de tareas
- **WHEN** un coordinador solicita la lista de tareas aplicando los filtros "asignado_a = ID_Profesor_1" y "estado = Pendiente"
- **THEN** el sistema retorna la lista paginada de tareas que cumplen la condición, ignorando quién fue el asignador (visibilidad total del tenant).

