## 1. DTOs y Schemas (Pydantic)

- [x] 1.1 Crear schemas para el listado de atrasados (`AlumnoAtrasado`, `ReporteAtrasadosResponse`).
- [x] 1.2 Crear schemas para el reporte de desempeño (`ActividadRanking`, `RankingActividadesResponse`).
- [x] 1.3 Crear schemas para la vista consolidada/sabana (`SabanaAlumno`, `SabanaResponse`).

## 2. Lógica de Análisis (Servicios)

- [x] 2.1 Implementar `AnalisisService.obtener_alumnos_atrasados` que identifique estudiantes con actividades no aprobadas evaluadas en una materia.
- [x] 2.2 Implementar `AnalisisService.obtener_ranking_actividades` que agrupe y calcule porcentajes de aprobación por actividad.
- [x] 2.3 Implementar `AnalisisService.obtener_sabana_notas` que construya la matriz final de alumnos vs notas por actividad.

## 3. Endpoints de la API

- [x] 3.1 Crear el router `backend/api/endpoints/analisis.py` y registrarlo en `main.py`.
- [x] 3.2 Endpoint GET `/api/analisis/materias/{materia_id}/atrasados` para retornar el reporte de riesgo.
- [x] 3.3 Endpoint GET `/api/analisis/materias/{materia_id}/ranking` para el ranking de actividades.
- [x] 3.4 Endpoint GET `/api/analisis/materias/{materia_id}/sabana` para la sabana de notas consolidadas.

## 4. Tests

- [x] 4.1 Escribir test unitario para el cálculo de atrasados verificando que sólo devuelve alumnos con `aprobado=False`.
- [x] 4.2 Escribir test unitario para la sabana de notas verificando la correcta estructuración y agrupación.
- [x] 4.3 Testear protección y control de acceso en los endpoints (RBAC).
