# creacion-avisos Specification

## Purpose
TBD - created by archiving change c-15-avisos-y-acknowledgment. Update Purpose after archive.
## Requirements
### Requirement: Crear avisos segmentados
El sistema SHALL permitir la creación de un nuevo aviso configurando su título, cuerpo (formato enriquecido), nivel de severidad, fechas de visibilidad, y su alcance específico: tenant global, por materia, por cohorte, por rol, o dirigido a un usuario individual (`USUARIO`). Cuando el alcance es `USUARIO` el aviso SHALL referenciar un `usuario_id` y NO ser visible para ningún otro usuario.

#### Scenario: Creación exitosa de aviso segmentado
- **WHEN** un rol de coordinación/admin crea un aviso definiendo el alcance "Materia X"
- **THEN** el sistema registra el `Aviso` y a partir de su fecha de inicio será listado como activo para todos los usuarios relacionados a "Materia X".

#### Scenario: Aviso dirigido a un alumno
- **WHEN** se crea un aviso con alcance `USUARIO` y un `usuario_id` válido
- **THEN** el sistema registra el `Aviso` asociado a ese `usuario_id`, y solo ese usuario lo verá entre sus avisos activos.

#### Scenario: Coherencia de alcance y destino
- **WHEN** se intenta crear un aviso con alcance `USUARIO` sin `usuario_id` (o con alcance segmentado pero enviando `usuario_id`)
- **THEN** el sistema rechaza la creación con un error de validación.

### Requirement: Contactar alumno en riesgo genera aviso dirigido
El sistema SHALL permitir que, desde el panel de alumnos atrasados/en riesgo de una materia, un docente contacte a un alumno generando un aviso con alcance `USUARIO` dirigido a ese alumno, en lugar de una comunicación saliente. El reporte de atrasados SHALL exponer el `usuario_id` del alumno para habilitar el envío.

#### Scenario: Docente contacta a un alumno en riesgo
- **WHEN** un docente confirma el contacto a un alumno en riesgo con título y cuerpo
- **THEN** el sistema crea un `Aviso` con alcance `USUARIO` dirigido al `usuario_id` de ese alumno, que aparecerá en "Mis Avisos" del alumno.

#### Scenario: Alumno de padrón sin usuario vinculado
- **WHEN** la entrada de padrón del alumno no tiene `usuario_id` vinculado
- **THEN** el sistema NO ofrece (o deshabilita) el contacto por aviso dirigido para ese alumno, evitando crear un aviso sin destinatario válido.

