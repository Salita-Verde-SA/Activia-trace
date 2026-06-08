## Why

Para cerrar el ciclo de trazabilidad académica, Activia Trace necesita un módulo formal para organizar, convocar y medir resultados de coloquios y evaluaciones. Esto permitirá a la institución y a los docentes planificar los exámenes (días, cupos), inscribir masivamente a alumnos y visualizar métricas de rendimiento en un único lugar.

## What Changes

- Modelos `Evaluacion`, `ReservaEvaluacion`, y `ResultadoEvaluacion` para representar la instancia de examen, las reservas de alumnos y sus notas.
- Funcionalidad para crear convocatorias definiendo materia, instancia (ej. "Coloquio Final"), días disponibles y cupos.
- Importador masivo de alumnos habilitados hacia una convocatoria específica.
- Panel de métricas en vivo para monitorear inscriptos, ausentes y tasas de aprobación de los coloquios.
- Vista de administración global y listado consolidado de convocatorias.

## Capabilities

### New Capabilities
- `convocatoria-coloquios`: Gestión del ciclo de vida de una evaluación (creación, asignación de días y cupos).
- `importacion-reservas`: Importación masiva de alumnos para inscribirlos formalmente en una convocatoria de evaluación.
- `metricas-evaluaciones`: Paneles de monitoreo que cruzan datos de reservas con los resultados ingresados para calcular asistencia y aprobación.
- `admin-global-evaluaciones`: Listados y búsquedas de evaluaciones para coordinadores y equipo de administración.

### Modified Capabilities
- No existen capabilities previas modificadas, es una funcionalidad nueva.

## Impact

- **Bases de datos**: Tablas nuevas (`evaluaciones`, `reservas_evaluaciones`, `resultados_evaluaciones`).
- **APIs**: Nuevos endpoints bajo `/api/evaluaciones/*` y `/api/admin/evaluaciones/*`.
- **Integraciones**: El importador procesará archivos CSV o se nutrirá directamente del padrón existente, sentando las bases para futuras liquidaciones por evaluación.
