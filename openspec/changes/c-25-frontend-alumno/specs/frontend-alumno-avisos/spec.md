## ADDED Requirements

### Requirement: Lectura de avisos dirigidos al ALUMNO
El sistema SHALL mostrar los avisos activos (cuya fecha de inicio es anterior a la actual y fin posterior) cuyo alcance incluya al alumno actual, sea por rol (ALUMNO), cohorte, o materia cursada.

#### Scenario: Visualización de lista de avisos
- **WHEN** el alumno navega a `/alumno/avisos`
- **THEN** visualiza la lista paginada de avisos activos ordenados por fecha y prioridad.

### Requirement: Confirmación de lectura (Acknowledgment)
El sistema SHALL proveer una acción para que el ALUMNO marque como leído un aviso que requiere acknowledgment.

#### Scenario: Alumno hace ack de un aviso
- **WHEN** el alumno hace clic en "Marcar como leído" en un aviso
- **THEN** la API registra la confirmación de lectura y el aviso deja de aparecer como pendiente o destacado.
