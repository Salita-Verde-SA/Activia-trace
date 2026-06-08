# coordinacion-avisos Specification

## Purpose
TBD - created by archiving change c-23-frontend-coordinacion. Update Purpose after archive.
## Requirements
### Requirement: Panel de Avisos Institucionales
El sistema SHALL permitir al ADMIN/COORDINADOR redactar avisos, definir su audiencia (todos, profesores, alumnos, por carrera) y exigir confirmación de lectura.

#### Scenario: Publicación con ACK requerido
- **WHEN** el administrador publica un aviso con el flag de `requiere_acuse` activado.
- **THEN** la UI muestra el aviso publicado y habilita un panel para monitorear en tiempo real quiénes han dado acuse de lectura.

#### Scenario: Dashboard de métricas de avisos
- **WHEN** el administrador entra a la sección de métricas de un aviso publicado.
- **THEN** la UI despliega un resumen estadístico (ej: 80% leídos) basado en el endpoint analítico de la API.

