## MODIFIED Requirements

### Requirement: Panel personal y comentarios
El sistema SHALL proveer un endpoint que retorne todas las tareas donde el usuario actual figure como `asignado_a`. El sistema SHALL permitir al asignado actualizar el estado de la tarea (reflejado en UI mediante drag & drop interactivo en un tablero Kanban) y registrar nuevos comentarios en `ComentarioTarea` visualizándolos de manera integrada en los detalles de la tarjeta.

#### Scenario: Transición de estado con comentario
- **WHEN** un usuario mueve su tarjeta a la columna "Resuelta" e ingresa el texto "Hablé con el alumno y solucioné el problema" en el campo de comentario
- **THEN** el sistema actualiza el estado de la tarea a "Resuelta", crea un registro en `ComentarioTarea` y actualiza la UI mostrando el nuevo estado y el comentario agregado.
