## ADDED Requirements

### Requirement: Inicio de hilo de mensajes internos
El sistema SHALL permitir a un usuario autenticado iniciar una conversación interna con otro usuario del mismo tenant, creando un nuevo "hilo" e insertando el mensaje inicial.

#### Scenario: Creación exitosa de hilo
- **WHEN** un usuario envía un mensaje inicial a un destinatario válido
- **THEN** se crea el hilo, se vincula a ambos participantes, y se persiste el primer mensaje

### Requirement: Respuestas en hilo existente
El sistema SHALL permitir agregar mensajes adicionales a un hilo existente, siempre y cuando el emisor sea uno de los participantes del hilo.

#### Scenario: Enviar respuesta
- **WHEN** un participante envía un mensaje en un hilo
- **THEN** se guarda el mensaje y se actualiza la fecha de última actualización del hilo

#### Scenario: Intento de envío por no participante
- **WHEN** un usuario que no pertenece al hilo intenta enviar un mensaje a ese hilo
- **THEN** el sistema lo rechaza con un código `403 Forbidden` o `404 Not Found`
