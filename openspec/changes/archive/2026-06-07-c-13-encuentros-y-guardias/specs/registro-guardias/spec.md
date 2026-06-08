## ADDED Requirements

### Requirement: Registro de guardias operativas
El sistema SHALL permitir el registro y consolidación de turnos de guardia completados por tutores o personal asignado.

#### Scenario: Carga manual de guardia
- **WHEN** un tutor registra su turno de guardia (indicando fecha, hora de inicio/fin y tareas)
- **THEN** el sistema guarda la entrada `Guardia` y la vincula al usuario y tenant.

#### Scenario: Exportación global de guardias
- **WHEN** la coordinación solicita un reporte de guardias en un período
- **THEN** el sistema genera y exporta un consolidado de todas las guardias completadas por el equipo en dicho rango temporal.
