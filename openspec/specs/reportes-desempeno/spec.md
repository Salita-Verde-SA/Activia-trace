## ADDED Requirements

### Requirement: Ranking de actividades aprobadas
El sistema SHALL devolver un ranking por actividad, calculando el porcentaje de alumnos del padrón activo que han aprobado cada actividad evaluada en una materia.

#### Scenario: Consulta de ranking de actividades
- **WHEN** un profesor consulta el reporte de desempeño de su materia.
- **THEN** el sistema retorna la lista de actividades con su respectivo porcentaje de aprobados sobre el total de alumnos inscritos en la materia.

### Requirement: Agrupación de notas finales
El sistema SHALL calcular y exponer una vista agrupada de las notas para todos los alumnos, para que puedan ser mostradas en un formato tipo "sabana" (tabla consolidada) en el cliente.

#### Scenario: Generación de sabana de notas
- **WHEN** se pide el reporte de notas finales de una materia.
- **THEN** el sistema devuelve una matriz donde cada fila es un alumno y las columnas representan las distintas actividades y sus calificaciones, indicando si fueron aprobadas o no.
