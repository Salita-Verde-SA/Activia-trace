## Context

En el sistema, la comunicación masiva y unidireccional (hacia alumnos) está cubierta. Sin embargo, para fines operativos (docente ↔ coordinador, o administración ↔ docentes), no existía una bandeja de mensajes interna segura y auditable. Además, gran parte del perfil del usuario estaba bloqueada, obligando a los usuarios a solicitar modificaciones manuales por base de datos, especialmente para la información crítica de pagos y liquidaciones.

## Goals / Non-Goals

**Goals:**
- Permitir la edición segura de datos clave del perfil por el propio usuario (alias_cbu, banco, etc.).
- Construir un módulo de `MensajeInterno` que permita agrupar mensajes en "hilos" entre usuarios autenticados.
- Exponer la bandeja de entrada para listar estos hilos, indicando mensajes no leídos.

**Non-Goals:**
- No se implementará en esta fase un chat en tiempo real (WebSockets/Server-Sent Events). La mensajería operará de forma asíncrona, tipo "inbox".
- No se permitirá edición de DNI o CUIL por parte del propio usuario (riesgo de inconsistencias fiscales); solo Admin podrá modificarlos.

## Decisions

- **Modelo de Mensajes**: Crearemos `HiloMensajeInterno` y `MensajeInterno`.
  - `HiloMensajeInterno`: Controla los participantes, asunto y última fecha de actualización para optimizar la bandeja de entrada.
  - `MensajeInterno`: Relacionado a un hilo, guarda el contenido, emisor, y estado (leído/no leído).
  - *Alternativa considerada*: Usar el existente `MensajeDirecto`. *Razón de rechazo*: `MensajeDirecto` fue modelado específicamente para las comunicaciones *hacia fuera* del sistema (notificaciones de N8N, email, Moodle), acoplado a un `EstadoMensaje` (Pendiente, Enviado). La mensajería interna requiere un flujo diferente de "leído/no leído".
- **Edición de Perfil**: Se agregará el endpoint `PUT /api/perfil/me` asegurando que los campos DNI/CUIL estén marcados con `exclude=True` o validados para ser omitidos, previniendo su modificación.
- **Auditoría**: La actualización del perfil disparará un registro en `AuditLog` detallando qué campos cambiaron, crucial para el rastreo de datos de facturación.

## Risks / Trade-offs

- **Risk: Creación excesiva de hilos/spam interno** → Podría llenar la base de datos o saturar a los usuarios. *Mitigation*: Inicialmente el sistema es de uso interno institucional, con usuarios de confianza. Se aplicarán límites de paginación estrictos.
- **Risk: Notificaciones no leídas no vistas** → Sin WebSockets, el usuario debe refrescar. *Mitigation*: El frontend (en C-21) consultará un endpoint `/api/mensajes/internos/no-leidos` al montar el layout principal.
