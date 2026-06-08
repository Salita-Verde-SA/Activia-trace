## ADDED Requirements

### Requirement: Panel personal y comentarios
El sistema SHALL proveer un endpoint que retorne todas las tareas donde el usuario actual figure como `asignado_a`. El sistema SHALL permitir al asignado actualizar el estado de la tarea y registrar nuevos comentarios en `ComentarioTarea`.

#### Scenario: Transición de estado con comentario
- **WHEN** un usuario marca su tarea como "Resuelta" y añade el texto "Hablé con el alumno y solucioné el problema"
- **THEN** el sistema actualiza el estado de la tarea a "Resuelta" y crea un registro en `ComentarioTarea` con el timestamp y autoría del usuario.
