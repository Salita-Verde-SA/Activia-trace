# creacion-avisos Specification

## Purpose
TBD - created by archiving change c-15-avisos-y-acknowledgment. Update Purpose after archive.
## Requirements
### Requirement: Crear avisos segmentados
El sistema SHALL permitir la creación de un nuevo aviso configurando su título, cuerpo (formato enriquecido), nivel de severidad, fechas de visibilidad, y su alcance específico (tenant global, por materia, por cohorte, por rol).

#### Scenario: Creación exitosa de aviso
- **WHEN** un rol de coordinación/admin crea un aviso definiendo el alcance "Materia X"
- **THEN** el sistema registra el `Aviso` y a partir de su fecha de inicio será listado como activo para todos los usuarios relacionados a "Materia X".

