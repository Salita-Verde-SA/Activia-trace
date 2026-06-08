# asignacion Specification

## Purpose
TBD - created by archiving change c-07-usuarios-y-asignaciones. Update Purpose after archive.
## Requirements
### Requirement: Registro de Asignaciones
El sistema DEBE permitir la creación de registros de `Asignacion` que vinculen a un `Usuario` con un `Rol`, opcionalmente dentro de un contexto académico específico (materia, carrera, cohorte o comisión).

#### Scenario: Asignación de rol a usuario
- **WHEN** un administrador asigna el rol de PROFESOR a un usuario para la materia "Matemáticas"
- **THEN** el sistema registra la asignación relacionando el usuario, el rol y la materia

### Requirement: Vigencia de Asignaciones
Toda `Asignacion` DEBE poseer campos de vigencia (`desde` y `hasta`). El sistema DEBE considerar una asignación como activa sólo si la fecha actual está dentro de este rango.

#### Scenario: Evaluación de vigencia
- **WHEN** un rol fue asignado con fecha `hasta` en el pasado
- **THEN** la asignación figura como histórica y no otorga permisos activos

### Requirement: Gestión de Asignaciones y Jerarquías
El sistema SHALL proveer endpoints CRUD protegidos bajo `/api/equipos/*` (usando el permiso `equipos:asignar`). Además, la asignación PUEDE tener un `responsable_id` para definir relaciones jerárquicas (por ejemplo, a quién reporta). Todas las modificaciones, incluyendo la edición en bloque de fechas de vigencia, SHALL generar un log de auditoría con la acción `ASIGNACION_MODIFICAR`.

#### Scenario: Creación de asignación con jerarquía
- **WHEN** se asigna un TUTOR y se le asocia un PROFESOR como `responsable_id`
- **THEN** el sistema guarda la relación jerárquica en la asignación

#### Scenario: Modificación en bloque de la vigencia del equipo
- **WHEN** el coordinador extiende la fecha `hasta` de todo el equipo de una cohorte
- **THEN** el sistema actualiza todas las asignaciones vigentes y emite un registro de auditoría por cada una

