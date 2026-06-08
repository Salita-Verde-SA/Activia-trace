## ADDED Requirements

### Requirement: Gestión del ciclo de vida de la tarea
El sistema SHALL permitir crear una `Tarea` definiendo un título, descripción, nivel de prioridad y usuario asignado. El sistema SHALL registrar automáticamente quién asignó la tarea (`asignado_por`) basándose en el usuario autenticado.

#### Scenario: Delegar tarea a otro usuario
- **WHEN** un usuario autenticado crea una tarea y define a `Usuario B` como `asignado_a`
- **THEN** el sistema registra la tarea en estado "Pendiente", asignando el id del creador en `asignado_por` y notificando o listando la tarea para el `Usuario B`.
