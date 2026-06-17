## ADDED Requirements

### Requirement: Detección de alumnos atrasados
El sistema SHALL identificar qué alumnos en una materia están atrasados, incluyendo tanto a los que tienen calificaciones no aprobatorias como a los que no tienen ninguna calificación registrada (faltantes totales). La evaluación de aprobación SHALL realizarse comparando la nota contra el umbral vigente **al momento de la consulta**, no el almacenado en `Calificacion.aprobado`.

#### Scenario: Alumno con notas menores al umbral vigente
- **WHEN** se solicita el listado de atrasados para una materia con umbral configurado en 50%.
- **THEN** el sistema retorna aquellos alumnos cuya nota numérica (normalizada a la misma escala que `umbral_pct`) es inferior al 50%, independientemente del valor de `Calificacion.aprobado` almacenado en la DB.

#### Scenario: Alumno sin ninguna calificación registrada
- **WHEN** un alumno del padrón activo no tiene ningún registro en `Calificacion` para la materia.
- **THEN** el sistema lo incluye en el reporte de atrasados con una lista vacía de actividades no aprobadas, indicando que todas sus actividades están faltantes.

#### Scenario: Alumno con todas las notas aprobatorias
- **WHEN** un alumno tiene calificaciones para todas las actividades y todas superan el umbral vigente.
- **THEN** el alumno NO aparece en el reporte de atrasados.
