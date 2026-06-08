## ADDED Requirements

### Requirement: Detección de alumnos atrasados
El sistema SHALL identificar qué alumnos en una materia o cohorte particular están atrasados, devolviendo una lista de alumnos que tienen al menos una actividad evaluada con nota no aprobatoria (`aprobado = False`).

#### Scenario: Alumno con notas menores al umbral
- **WHEN** se solicita el listado de atrasados para una materia.
- **THEN** el sistema retorna aquellos alumnos que tienen alguna `Calificacion` con `aprobado == False` registrada en su historial.
