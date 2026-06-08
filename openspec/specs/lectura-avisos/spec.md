# lectura-avisos Specification

## Purpose
TBD - created by archiving change c-15-avisos-y-acknowledgment. Update Purpose after archive.
## Requirements
### Requirement: Lectura y Acknowledgment
El sistema SHALL proveer un endpoint para que un usuario pueda consultar sus avisos activos según su pertenencia (materia, cohorte, global) y registrar explícitamente la lectura de aquellos avisos que lo exijan.

#### Scenario: Usuario consulta avisos activos
- **WHEN** el usuario consulta sus avisos pendientes
- **THEN** el sistema evalúa a qué materias y cohortes está asignado el usuario, y devuelve la unión de todos los avisos aplicables que estén en fecha y aún no tengan un `AcknowledgmentAviso` por su parte.

#### Scenario: Usuario registra lectura
- **WHEN** un usuario emite un ack sobre un aviso
- **THEN** el sistema inserta el registro en `AcknowledgmentAviso` con el timestamp correspondiente, impidiendo a la UI seguir mostrándolo como pendiente.

