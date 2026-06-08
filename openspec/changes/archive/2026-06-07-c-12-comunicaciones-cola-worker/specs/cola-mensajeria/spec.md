## ADDED Requirements

### Requirement: Encolado de mensajes
El sistema SHALL permitir encolar mensajes dirigidos a alumnos bajo un identificador de lote (`lote_id`). Estos mensajes deberán guardarse en estado `Pendiente`.

#### Scenario: Creación de lote de mensajes
- **WHEN** un docente inicia un proceso de envío masivo para alumnos atrasados.
- **THEN** el sistema registra en la base de datos cada comunicación individual en estado `Pendiente` con el mismo `lote_id`.

### Requirement: Cifrado de destinatario
El sistema MUST cifrar el campo destinatario (ej. email) de cada comunicación persistida, usando AES-256 para proteger PII.

#### Scenario: Inspección de base de datos
- **WHEN** se consulta la tabla de comunicaciones directamente.
- **THEN** el campo del destinatario se encuentra ilegible (cifrado).
