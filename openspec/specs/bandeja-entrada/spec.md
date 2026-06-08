# bandeja-entrada Specification

## Purpose
TBD - created by archiving change c-20-perfil-y-mensajeria-interna. Update Purpose after archive.
## Requirements
### Requirement: Listado de hilos por usuario
El sistema SHALL devolver una lista paginada de todos los hilos en los que el usuario autenticado participa, ordenados por la fecha del último mensaje descendente.

#### Scenario: Visualización de bandeja
- **WHEN** un usuario solicita su bandeja de entrada
- **THEN** recibe los hilos ordenados por actividad reciente, junto con un resumen del último mensaje y el conteo de mensajes no leídos.

### Requirement: Detalle de mensajes del hilo
El sistema SHALL devolver la lista completa de mensajes pertenecientes a un hilo específico, marcándolos como leídos automáticamente para el usuario consultante.

#### Scenario: Abrir conversación
- **WHEN** el usuario consulta un hilo válido donde participa
- **THEN** retorna la cronología de mensajes y actualiza el estado de lectura del receptor

### Requirement: Conteo de no leídos global
El sistema SHALL proveer un endpoint rápido para consultar la cantidad total de mensajes no leídos del usuario para integrarse a la UI general.

#### Scenario: Consultar badge no leídos
- **WHEN** el cliente hace polling de no leídos
- **THEN** retorna el conteo entero de todos los mensajes dirigidos a este usuario cuyo estado de lectura sea falso

