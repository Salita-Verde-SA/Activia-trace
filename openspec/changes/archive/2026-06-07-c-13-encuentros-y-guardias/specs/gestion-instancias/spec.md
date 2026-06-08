## ADDED Requirements

### Requirement: Edición de instancias individuales
El sistema SHALL permitir editar independientemente cada instancia de encuentro generada.

#### Scenario: Edición de recursos y estado
- **WHEN** el docente agrega una URL de Meet, URL de grabación de video o comentario a la instancia
- **THEN** la instancia se actualiza sin afectar a las otras instancias generadas por el mismo slot recurrente.

#### Scenario: Cancelación de instancia
- **WHEN** un encuentro puntual es suspendido o reprogramado
- **THEN** la instancia se marca como cancelada (o reprogramada) preservando el registro de auditoría.
