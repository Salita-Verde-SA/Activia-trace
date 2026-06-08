## Why

Para soportar la coordinación del equipo docente y administrativo, Activia Trace necesita un sistema de tareas internas de alto volumen. Esto permitirá a los coordinadores y profesores delegar actividades (como corregir exámenes, contactar a un alumno en riesgo) manteniendo un registro de estados y comentarios asincrónicos, asegurando la trazabilidad operativa.

## What Changes

- Modelado de base de datos para `Tarea` y `ComentarioTarea`.
- Endpoints de creación y asignación cruzada de tareas.
- Endpoints de flujo de trabajo (transición de estados y adición de comentarios en hilo).
- Panel "Mis Tareas" para usuarios individuales.
- Panel de "Administración Global de Tareas" con filtros para los coordinadores.

## Capabilities

### New Capabilities
- `abm-tareas`: Ciclo de vida de una tarea (Pendiente, En progreso, Resuelta, Cancelada), incluyendo delegación y trazabilidad de quién asignó a quién.
- `mis-tareas`: Consulta y gestión de las tareas asignadas al usuario actual, incluyendo comentarios y actualizaciones de estado.
- `admin-global-tareas`: Vista global para roles jerárquicos (coordinadores/admins) que permite filtrar, reasignar y monitorear tareas a nivel tenant.

### Modified Capabilities
- N/A

## Impact

- **Bases de datos**: Nuevas tablas `tareas` y `comentarios_tareas`.
- **APIs**: Nuevos endpoints en `/api/tareas` resguardados por el permiso `tareas:gestionar`.
- **Performance**: Al ser un módulo de muy alto uso concurrente, los queries del panel de administración global requerirán índices adecuados por asignado, estado y fecha.
