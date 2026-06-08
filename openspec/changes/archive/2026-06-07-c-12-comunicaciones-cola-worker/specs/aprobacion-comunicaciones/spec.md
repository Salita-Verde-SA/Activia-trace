## ADDED Requirements

### Requirement: Previsualización de mensajes
El sistema SHALL permitir previsualizar el contenido y destinatarios de un lote de mensajes antes de su aprobación y envío definitivo.

#### Scenario: Solicitud de previsualización
- **WHEN** el usuario consulta los mensajes asociados a un `lote_id` en estado `Pendiente`.
- **THEN** el sistema retorna la lista desencriptando el destinatario en memoria para la respuesta API.

### Requirement: Aprobación de envío
El sistema MUST requerir que un supervisor con el permiso `comunicacion:aprobar` apruebe un lote o mensaje individual antes de que el worker lo procese. Al aprobar, el sistema cambiará el estado necesario para que el worker lo tome, o lo marcará como validado.

#### Scenario: Aprobación exitosa
- **WHEN** un supervisor con los permisos adecuados aprueba un `lote_id`.
- **THEN** las comunicaciones quedan habilitadas para ser tomadas por el worker, y se genera un evento de auditoría `COMUNICACION_ENVIAR`.

#### Scenario: Rechazo por permisos
- **WHEN** un docente sin permiso `comunicacion:aprobar` intenta aprobar un `lote_id`.
- **THEN** el sistema retorna error `403 Forbidden` y no habilita los mensajes.
