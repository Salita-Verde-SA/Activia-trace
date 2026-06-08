## Context
El seguimiento de actividades asignadas entre docentes (ej. "Revisar TP de Alumno X", "Contactar a alumno en riesgo") actualmente carece de trazabilidad. Se necesita un gestor de tareas interno ("Issue Tracker") que soporte cientos de tareas concurrentes, delegación, transición de estados y comentarios en hilo, todo en un contexto seguro.

## Goals / Non-Goals

**Goals:**
- Implementar el CRUD de `Tarea` y `ComentarioTarea`.
- Permitir la asignación a un `Usuario` y guardar registro de quién lo asignó (`asignado_por`).
- Soportar los estados: Pendiente, En progreso, Resuelta, Cancelada.
- Exponer un panel personal "Mis Tareas" y un panel de administración global.

**Non-Goals:**
- No se incluirá adjuntos en las tareas ni integración con calendarios externos por el momento.
- No reemplaza a la mensajería, es estrictamente para trabajo interno.

## Decisions
- **Estructura del Comentario**: Se usará una tabla separada `ComentarioTarea` en lugar de un campo JSONB, dado que los comentarios crecerán indefinidamente y pueden requerir búsquedas o paginación en el futuro.
- **Workflow asincrónico**: Actualizar el estado de la tarea y agregar un comentario se podrán hacer en una misma operación (ej. "Pasar a Resuelta" + "Se resolvió contactando al alumno").
- **Optimización de listados**: El panel de administración global requiere índices en `asignado_a`, `estado` y `tenant_id`, dado que consultará sobre todo el volumen de tareas del tenant.

## Risks / Trade-offs
- **[Risk]** Volumen de datos: El uso como un tracker interno generará un crecimiento rápido de filas en `tareas` y `comentarios_tareas`.
  - **Mitigation**: El soft delete y los filtros por defecto limitados a "no resueltas" mantendrán el panel ágil. Los comentarios no se cargarán en las listas generales, solo al consultar el detalle de una tarea específica.
