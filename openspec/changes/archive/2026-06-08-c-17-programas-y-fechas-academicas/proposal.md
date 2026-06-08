## Why

El sistema requiere gestionar los programas y fechas académicas (parciales, TPs, coloquios) asociados a cada materia. Esto es necesario para proveer la información estructurada que luego se inyecta en el aula virtual (LMS), permitiendo a los docentes y alumnos tener visibilidad centralizada del cronograma y de los documentos formales de la materia.

## What Changes

- Creación de los modelos `ProgramaMateria` y `FechaAcademica` en la base de datos con aislamiento de tenant (tenant_id).
- Implementación de los endpoints `/api/programas` para subida y asociación de archivos de programas (requiere permiso `estructura:gestionar`).
- Implementación de los endpoints `/api/fechas-academicas` para gestionar fechas con soporte de listado tabular y vista de calendario.
- Funcionalidad para generar fragmentos de contenido de fechas y programas que se exportarán hacia el LMS (Moodle).

## Capabilities

### New Capabilities
- `programas-academicos`: Gestión de carga y asociación de documentos PDF o archivos referenciados a un dictado específico (materia × carrera × cohorte).
- `fechas-academicas`: Registro y consulta de fechas de evaluación y eventos clave de la materia en una vista calendárica.

### Modified Capabilities
- Ninguna.

## Impact

- **Modelos de Datos**: Se agregan dos nuevas tablas a la base de datos (`programa_materia`, `fecha_academica`), lo cual requerirá una migración de Alembic.
- **APIs**: Nuevos routers en FastAPI bajo `/api/programas` y `/api/fechas-academicas`.
- **Integraciones**: Servirá como base de datos para la generación del contenido estático a publicar en Moodle.
- **Frontend**: Nuevas pantallas de gestión de programas y un calendario/listado de fechas académicas.
