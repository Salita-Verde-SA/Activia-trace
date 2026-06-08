## MODIFIED Requirements

### Requirement: Gestión de Asignaciones y Jerarquías
El sistema SHALL proveer endpoints CRUD protegidos bajo `/api/equipos/*` (usando el permiso `equipos:asignar`). Además, la asignación PUEDE tener un `responsable_id` para definir relaciones jerárquicas (por ejemplo, a quién reporta). Todas las modificaciones, incluyendo la edición en bloque de fechas de vigencia, SHALL generar un log de auditoría con la acción `ASIGNACION_MODIFICAR`.

#### Scenario: Creación de asignación con jerarquía
- **WHEN** se asigna un TUTOR y se le asocia un PROFESOR como `responsable_id`
- **THEN** el sistema guarda la relación jerárquica en la asignación

#### Scenario: Modificación en bloque de la vigencia del equipo
- **WHEN** el coordinador extiende la fecha `hasta` de todo el equipo de una cohorte
- **THEN** el sistema actualiza todas las asignaciones vigentes y emite un registro de auditoría por cada una
