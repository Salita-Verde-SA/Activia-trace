## ADDED Requirements

### Requirement: Worker asíncrono
El sistema SHALL contar con un proceso en background (worker asíncrono) que consulte periódicamente la tabla de comunicaciones buscando aquellas habilitadas para envío.

#### Scenario: Procesamiento de lote aprobado
- **WHEN** existen comunicaciones aprobadas y pendientes de envío.
- **THEN** el worker las toma, transiciona su estado a `Enviando`, simula/realiza el envío, y transiciona el estado final a `Enviado` o `Error`.

### Requirement: Control de reintentos y fallos
El sistema SHOULD registrar la fecha y hora de envío y gestionar posibles fallos capturando excepciones sin que el worker principal se detenga.

#### Scenario: Fallo de conexión externa
- **WHEN** el worker falla al contactar al proveedor de correo.
- **THEN** la comunicación cambia a estado `Error` para permitir futuras re-ejecuciones.
