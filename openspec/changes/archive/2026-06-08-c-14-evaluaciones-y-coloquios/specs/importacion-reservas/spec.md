## ADDED Requirements

### Requirement: Importar alumnos a convocatoria
El sistema SHALL proveer una ruta para inscribir masivamente alumnos a una convocatoria, generando sus registros en `ReservaEvaluacion`.

#### Scenario: Importación masiva de padrón habilitado
- **WHEN** un administrador o coordinador importa un listado de legajos/emails válidos para la materia
- **THEN** el sistema verifica la existencia de cada usuario, genera un registro de `ReservaEvaluacion` para cada uno y guarda una bitácora de auditoría de la importación.
