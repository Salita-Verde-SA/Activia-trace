## MODIFIED Requirements

### Requirement: Gestión del ciclo de vida de la tarea
El sistema SHALL permitir crear una `Tarea` definiendo un título, descripción, nivel de prioridad y usuario asignado. El sistema SHALL registrar automáticamente quién asignó la tarea (`asignado_por`) basándose en el usuario autenticado. El sistema SHALL asegurar que la creación y el listado de comentarios de una tarea estén expuestos a través de los endpoints correspondientes y su UI.

#### Scenario: Delegar tarea a otro usuario
- **WHEN** un usuario autenticado crea una tarea y define a `Usuario B` como `asignado_a`
- **THEN** el sistema registra la tarea en estado "Pendiente", asignando el id del creador en `asignado_por` y notificando o listando la tarea para el `Usuario B`.

#### Scenario: Visualizar y agregar comentarios
- **WHEN** un usuario autorizado accede al detalle de la tarea e ingresa un nuevo comentario
- **THEN** el sistema persiste el comentario vinculado a la tarea y lo retorna inmediatamente en la lista de comentarios.
