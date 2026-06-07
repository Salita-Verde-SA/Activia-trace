## Why

La gestión de equipos docentes es fundamental para la operación de la institución. Al haber completado la base de asignaciones (`C-07`), necesitamos proveer a los coordinadores y administradores las herramientas para asignar docentes en bloque, clonar equipos de un cuatrimestre a otro (para ahorrar tiempo operativo) y permitir que los docentes visualicen sus propios equipos.

## What Changes

- **Gestión de Asignaciones**: Endpoints para asignar docentes a materias/cohortes con roles específicos y vigencia.
- **Asignación Masiva**: Capacidad para realizar asignaciones en bloque (docentes × materia × carrera × cohorte × rol).
- **Clonado de Equipos**: Funcionalidad para duplicar asignaciones vigentes de un período a otro nuevo, aplicando nuevas fechas `desde` / `hasta` (RN-12).
- **Modificación de Vigencia General**: Herramienta para ajustar en bloque la vigencia de un equipo entero.
- **Vistas para Docentes**: Endpoint `mis-equipos` para que un docente pueda visualizar sus asignaciones activas.
- **Auditoría**: Todas las acciones de modificación generarán trazas de auditoría (`ASIGNACION_MODIFICAR`).
- **Exportación**: Capacidad para exportar la conformación del equipo a un archivo.

## Capabilities

### New Capabilities
- `equipos-docentes`: Gestión de equipos docentes, asignación masiva, clonado entre períodos y vistas para docentes.

### Modified Capabilities
- `asignacion`: Ampliación de requerimientos para soportar clonado en bloque y auditoría exhaustiva de modificaciones.

## Impact

- **API**: Creación de nuevos endpoints bajo `/api/equipos/*` protegidos por el permiso `equipos:asignar`.
- **Servicios**: Ampliación de `AsignacionService` para soportar transacciones masivas y clonado.
- **Auditoría**: Integración estrecha con el sistema de trazas para el evento `ASIGNACION_MODIFICAR`.
