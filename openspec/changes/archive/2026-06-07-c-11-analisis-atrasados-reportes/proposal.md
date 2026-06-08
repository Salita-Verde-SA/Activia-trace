## Why

Con las calificaciones ingresadas en el sistema y los umbrales configurados, necesitamos consolidar la información para identificar alumnos en riesgo o atrasados, y para mostrar el estado global de la materia. Esto permite a los tutores, profesores y coordinadores intervenir tempranamente y dar seguimiento continuo (F2.2 a F2.5).

## What Changes

- Implementación del cálculo de alumnos atrasados basado en si la nota está por debajo del umbral o si faltan entregas obligatorias.
- Desarrollo del ranking de actividades aprobadas para obtener rápidamente el porcentaje de alumnos que superó cierta instancia evaluativa.
- Creación de endpoints para reportes rápidos agrupados por materia y reportes de notas finales.
- Consultas y agregaciones optimizadas para la tabla de calificaciones vinculada a los umbrales y a la versión activa del padrón.

## Capabilities

### New Capabilities
- `analisis-atrasados`: Detección de estudiantes atrasados o en riesgo con base en las calificaciones y umbrales definidos.
- `reportes-desempeno`: Reportes rápidos por materia, incluyendo ranking de actividades y notas finales agrupadas.

### Modified Capabilities
- (Ninguna)

## Impact

- Se crearán servicios de análisis sobre los repositorios `Calificacion` y `UmbralMateria`.
- Nuevos endpoints bajo `/api/reportes` o `/api/analisis`.
- La información devuelta será utilizada por el frontend para visualizar dashboards de progreso.
