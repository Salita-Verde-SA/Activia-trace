## Why

Para garantizar la comunicación efectiva y auditable de información importante, Activia Trace necesita un sistema interno de avisos. Esto resuelve el problema de notificar cambios de fechas, alertas institucionales o novedades de una materia específica, asegurando además (mediante un sistema de acuse de recibo o "acknowledgment") que los usuarios clave han leído la información crítica.

## What Changes

- Creación de los modelos `Aviso` y `AcknowledgmentAviso`.
- Endpoints para crear avisos segmentados por alcance: Global, Por Materia, Por Cohorte o Por Rol.
- Endpoint para que los usuarios consulten sus avisos activos.
- Flujo de confirmación de lectura obligatoria (ack).
- Panel de métricas de lectura para los emisores del aviso (saber quién leyó y quién falta).

## Capabilities

### New Capabilities
- `creacion-avisos`: Gestión del ciclo de vida de los avisos, definiendo su título, cuerpo, severidad, período de visibilidad y el segmento destino.
- `lectura-avisos`: Consulta de avisos pertinentes al usuario actual y registro del "acuse de recibo" (ack) para aquellos que lo requieran.
- `metricas-avisos`: Monitoreo en tiempo real de la tasa de lectura y listado de usuarios pendientes de confirmación.

### Modified Capabilities
- N/A

## Impact

- **Bases de datos**: Nuevas tablas `avisos` y `acknowledgments_avisos`.
- **APIs**: Nuevos endpoints en `/api/avisos` y `/api/admin/avisos`.
- **UI**: La aplicación cliente deberá incorporar un panel de notificaciones y forzar la visualización de avisos críticos antes de permitir otras interacciones.
