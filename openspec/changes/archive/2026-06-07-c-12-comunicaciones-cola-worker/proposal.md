## Why

Activia-trace detecta atrasos y genera datos de rendimiento, pero carece de un medio automatizado e institucional para notificar a los alumnos sobre su situación. Para cumplir con el modelo de gobernanza y trazabilidad (RN-15, RN-16, RN-17), se requiere un sistema que pueda encolar comunicaciones, cifrar a los destinatarios para asegurar PII, requerir la aprobación manual de un supervisor y luego despacharlas usando un worker asíncrono.

## What Changes

- Creación del modelo `Comunicacion` con seguimiento de estado (`Pendiente` -> `Enviando` -> `Enviado/Error/Cancelado`), preservando el PII de los destinatarios cifrado (AES-256).
- Implementación de un worker asíncrono que consumirá la cola de comunicaciones y simulará o delegará el envío real (via N8N/SMTP) transicionando estados.
- Desarrollo de endpoints para encolar, previsualizar y autorizar (aprobar o cancelar) estas comunicaciones.
- Nueva migración en la base de datos (Alembic) para el modelo `Comunicacion`.

## Capabilities

### New Capabilities
- `cola-mensajeria`: Soporte para crear, previsualizar y encolar mensajes en masa hacia alumnos en riesgo.
- `aprobacion-comunicaciones`: Control de calidad (RBAC `comunicacion:aprobar`) previo al envío definitivo.
- `worker-envio`: Proceso en background que despacha y audita mensajes.

### Modified Capabilities
- Ninguna.

## Impact

- **API**: Nuevos endpoints bajo `/api/comunicaciones/*` que consumen el modelo de Padrón y Usuarios.
- **Base de Datos**: Nueva tabla `comunicaciones` y migración Alembic.
- **Background**: Infraestructura base para un worker asíncrono en Python.
