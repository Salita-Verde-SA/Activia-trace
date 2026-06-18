# lectura-avisos Specification

## Purpose
TBD - created by archiving change c-15-avisos-y-acknowledgment. Update Purpose after archive.
## Requirements
### Requirement: Lectura y Acknowledgment
El sistema SHALL proveer un endpoint para que un usuario pueda consultar sus avisos activos según su pertenencia (materia, cohorte, global, rol) **y los avisos dirigidos a él individualmente** (alcance `USUARIO` con su `usuario_id`), y registrar explícitamente la lectura de aquellos avisos que lo exijan. La respuesta SHALL incluir, por aviso, su fecha de publicación (`fecha_publicacion`), su contenido y el momento de lectura (`ack_at`, nulo si no fue leído). Los avisos ya leídos NO se eliminan del listado: permanecen visibles marcados como leídos.

#### Scenario: Usuario consulta avisos activos
- **WHEN** el usuario consulta sus avisos
- **THEN** el sistema evalúa a qué materias, cohortes y roles está asignado el usuario, suma los avisos dirigidos a su `usuario_id` (alcance `USUARIO`), y devuelve la unión de los avisos aplicables que estén en fecha, cada uno con su `fecha_publicacion` y su `ack_at` (nulo si aún no fue leído).

#### Scenario: Alumno ve un aviso dirigido
- **WHEN** un alumno con un aviso de alcance `USUARIO` dirigido a él consulta "Mis Avisos"
- **THEN** el aviso aparece en su lista, y ningún otro usuario lo ve.

#### Scenario: Aviso leído permanece visible
- **WHEN** un usuario registra un ack sobre un aviso
- **THEN** el sistema inserta el `AcknowledgmentAviso` con su timestamp, y en consultas posteriores el aviso SIGUE apareciendo en el listado con `ack_at` poblado (marcado como leído), dejando de contar como no leído.

