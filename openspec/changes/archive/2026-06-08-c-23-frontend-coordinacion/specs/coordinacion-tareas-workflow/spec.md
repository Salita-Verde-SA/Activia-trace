## ADDED Requirements

### Requirement: Panel de Tareas y Workflow
El sistema SHALL proveer una vista Kanban o lista para la gestión de tareas internas de coordinación, soportando flujos de trabajo con asignación y cambio de estados.

#### Scenario: Transición de estado de tarea
- **WHEN** un miembro de coordinación mueve una tarea de "Pendiente" a "En Progreso".
- **THEN** la UI actualiza el tablero y envía la mutación a la API para registrar el cambio en el log de auditoría del ticket.
