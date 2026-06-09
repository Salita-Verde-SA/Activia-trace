## ADDED Requirements

### Requirement: Consulta de estado académico
El sistema SHALL permitir al alumno visualizar un resumen de su situación académica en las materias que cursa.

#### Scenario: Visualización del estado de notas
- **WHEN** el alumno navega a `/alumno/estado`
- **THEN** visualiza un listado de las materias donde tiene inscripciones o notas, junto a las calificaciones parciales y el estado final (promocionado, regular, libre).
