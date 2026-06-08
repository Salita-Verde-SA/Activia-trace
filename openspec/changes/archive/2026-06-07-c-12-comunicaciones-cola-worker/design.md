## Context

Las notificaciones a alumnos (por atraso o reportes en general) requieren una solución asíncrona porque enviar muchos correos o mensajes simultáneamente puede bloquear el thread de la API web (FastAPI) y saturar los servicios externos, y además se necesita un sistema robusto que reintente en caso de falla y audite los envíos. Adicionalmente, el contenido lleva datos personales que deben protegerse, y la operación debe ser validada por un humano según la regla RN-17.

## Goals / Non-Goals

**Goals:**
- Implementar el modelo de datos `Comunicacion` con seguimiento de estado (Pendiente, Enviando, Enviado, Error, Cancelado).
- Implementar encriptación AES-256 para el campo `destinatario`.
- Desarrollar un mecanismo de worker background asíncrono para despachar mensajes que estén en estado 'Pendiente' hacia un estado final, una vez que son aprobados.
- Crear endpoints para previsualizar, encolar masivamente, y aprobar comunicaciones (`comunicacion:aprobar`).

**Non-Goals:**
- Implementación de un conector real con SMTP o N8N (en esta fase el worker puede simplemente loguear el envío o llamar a un servicio dummy que represente la integración futura).
- Lógica de plantillas HTML complejas (se usarán variables simples o texto plano/markdown de momento).

## Decisions

- **Framework del Worker**: En lugar de introducir Celery o Redis Queue para mantener la complejidad baja en esta fase, usaremos un loop asíncrono nativo (task scheduler básico integrado) que pollée la base de datos cada N segundos buscando comunicaciones en estado `Pendiente`.
- **Cifrado**: Se utilizará AES-256 (vía `cryptography.fernet` o el módulo preexistente) para cifrar la columna `destinatario_cifrado` al escribir y descifrar en memoria al enviar.
- **Auditoría**: Se registrará un evento `COMUNICACION_ENVIAR` en el `audit_log` cuando el supervisor apruebe la tanda de envíos.
- **Aprobación Lotes**: Se usará el concepto de `lote_id` (UUID compartido entre múltiples comunicaciones) para aprobar masivamente.

## Risks / Trade-offs

- **Riesgo**: El polling a la base de datos para buscar mensajes `Pendiente` puede ser ineficiente si crece el volumen.
  - **Mitigación**: Añadir índices en la tabla `comunicaciones` por `(tenant_id, estado)` para acelerar el query. Usar `FOR UPDATE SKIP LOCKED` en Postgres.
- **Trade-off**: Usar un worker embebido en la app FastAPI. Es más fácil de desplegar y mantener, pero no permite escalar los procesos de workers independientemente del web server. Dado que son peticiones I/O bound, es adecuado de momento.
