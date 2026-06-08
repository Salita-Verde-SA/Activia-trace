## ADDED Requirements

### Requirement: CRUD de Fechas Académicas
El sistema SHALL permitir registrar y administrar las fechas académicas clave (e.g., parciales, trabajos prácticos, coloquios) de las cursadas.

#### Scenario: Creación de fecha académica
- **WHEN** un usuario (docente o admin) envía una petición para registrar un PARCIAL para una cohorte y materia.
- **THEN** el sistema persiste la fecha asignada con el `tenant_id` y devuelve un status 201.

#### Scenario: Recuperación de cronograma de fechas
- **WHEN** el frontend solicita el listado de fechas para pintar un calendario de una materia/cohorte.
- **THEN** el sistema devuelve una lista de fechas ordenadas cronológicamente, sin incluir eventos borrados lógicamente.

#### Scenario: Edición de fecha existente
- **WHEN** un coordinador modifica la fecha de un recuperatorio de un PARCIAL.
- **THEN** el sistema actualiza el registro sin perder la asociación original a la materia y cohorte.
