## ADDED Requirements

### Requirement: Búsqueda y reserva de coloquios
El sistema SHALL permitir al alumno visualizar los coloquios/evaluaciones disponibles y reservar un turno, disminuyendo el cupo disponible de la instancia seleccionada.

#### Scenario: Alumno efectúa una reserva exitosa
- **WHEN** el alumno selecciona un turno abierto con cupo disponible y hace clic en "Reservar"
- **THEN** la API registra la `ReservaEvaluacion`, descuenta el cupo y actualiza la vista mostrando la confirmación de la reserva.

#### Scenario: Alumno cancela su reserva
- **WHEN** el alumno cancela una reserva activa antes del cierre del período de inscripción
- **THEN** la reserva se marca como cancelada y se libera el cupo para otro alumno.
