## Context
Activia Trace debe soportar la administración de coloquios y evaluaciones, unificando la creación de convocatorias, la gestión de cupos/turnos, y la registración de reservas y resultados. Esto provee información vital para el seguimiento académico y asegura trazabilidad institucional.

## Goals / Non-Goals

**Goals:**
- Implementar el modelo de datos `Evaluacion`, `ReservaEvaluacion` y `ResultadoEvaluacion`.
- Soportar importación masiva de inscripciones/reservas a una evaluación.
- Brindar dashboards de métricas por evaluación y un listado de control global.

**Non-Goals:**
- Portal de auto-inscripción para el alumno. (En esta fase, el docente o bedelía inscribe/importa masivamente al alumnado).
- No se vincularán directamente estas instancias de evaluación con liquidaciones económicas en este scope.

## Decisions
- **Diferenciación de Reserva vs. Resultado**: La inscripción a la mesa (`ReservaEvaluacion`) y la nota (`ResultadoEvaluacion`) se modelan separadas para posibilitar reportes de ausentismo (reserva activa sin resultado).
- **Importador CSV/JSON**: Para inscribir alumnos, se proveerá un endpoint que acepte un lote de inscriptos y procese su conversión a `ReservaEvaluacion` en una única transacción de base de datos.
- **Métricas On-the-fly**: Las estadísticas (aprobados, desaprobados, ausentes) se derivarán calculando sobre la base en tiempo real, sin usar tablas desnormalizadas que agreguen complejidad de sincronización.

## Risks / Trade-offs
- **[Risk]** Inconsistencia de datos en la FK de Alumno si el usuario no fue dado de alta.
  - **Mitigation:** El diseño en la KB `E14` enlaza `ReservaEvaluacion.alumno_id` a `Usuario`. El importador requerirá verificar que el alumno exista en el tenant, rechazando (con error detallado) las filas que no lo cumplan.
