## Context

El sistema ya registra las calificaciones y posee la lógica de umbrales en `UmbralMateria`. Ahora se necesita un módulo que cruce el padrón activo (`EntradaPadron`) con las `Calificacion` para detectar alumnos en riesgo o extraer estadísticas globales para la materia.

## Goals / Non-Goals

**Goals:**
- Proveer un listado de alumnos que no han aprobado las actividades (atrasados).
- Calcular un resumen del desempeño general de una materia (ranking de actividades y alumnos).
- Retornar estos reportes en JSON para ser consumidos por el frontend.

**Non-Goals:**
- Interfaz gráfica (frontend) para visualizar estos reportes (es otra fase).
- Disparo automático de alertas por correo (se abordará en el módulo de comunicación `C-12`).

## Decisions

- **Cómputo "Al Vuelo" vs Materializado**: El volumen esperado por materia no supera los pocos cientos de alumnos en general, por lo que el cálculo de atrasados y reportes se hará *al vuelo* leyendo de las tablas usando consultas asíncronas de SQLAlchemy en vez de crear tablas de resumen materializadas.
- **Definición de "Atrasado"**: Un alumno está atrasado si para las actividades evaluadas (presentes en la base para su materia) carece de una calificación donde `aprobado = True`. Si una actividad no está subida al sistema aún, no cuenta como atraso.
- **Estructura de Retorno (DTOs)**: Se crearán esquemas Pydantic específicos para estadísticas (`ReporteAtrasadosResponse`, `RankingActividadesResponse`), desacoplando la estructura de base de datos de la API.

## Risks / Trade-offs

- **Riesgo:** Consultas N+1 al calcular atrasados.
  - **Mitigación:** Usar `selectinload` o `joinedload` en las consultas SQLAlchemy, o estructurar la query con funciones de agregación (ej. `GROUP BY entrada_padron_id`).
- **Trade-off:** La lógica al vuelo puede ralentizarse en materias muy grandes (miles de alumnos). Si el rendimiento decae, se considerará caché local o redis.
