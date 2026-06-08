## ADDED Requirements

### Requirement: Cliente de Moodle Web Services
El sistema SHALL contar con una abstracción robusta de cliente HTTP hacia Moodle que encapsule las llamadas al archivo `server.php` REST / XML-RPC de Moodle, autenticando la petición con un token estático provisto en el entorno o por configuración de tenant.

#### Scenario: Error encubierto de Moodle (200 OK con mensaje de error)
- **WHEN** Moodle responde con un código HTTP 200 pero el payload JSON/XML contiene una estructura de excepción interna
- **THEN** el cliente HTTP integrado SHALL detectar la excepción, no retornar 200 OK en las capas superiores y mapear la respuesta a un error HTTP 502 (Bad Gateway) interno

### Requirement: Sincronización On-Demand de Padrón
El sistema SHALL permitir la sincronización de alumnos inscriptos en un curso particular de Moodle a pedido del usuario a través de un endpoint protegido.

#### Scenario: Fetch de padrón Moodle
- **WHEN** el profesor presiona "Sincronizar Padrón de Moodle"
- **THEN** el sistema se conecta a Moodle, obtiene la lista de estudiantes enrolados, genera una nueva `VersionPadron` y la activa
