## ADDED Requirements

### Requirement: Crear convocatoria de coloquio/evaluación
El sistema SHALL permitir definir una convocatoria formal para una instancia de evaluación (Parcial, Coloquio, etc.) configurando fechas, días disponibles y cupos de atención.

#### Scenario: Creación exitosa de convocatoria
- **WHEN** un rol autorizado (coordinador o profesor) crea una evaluación indicando la materia, el tipo de evaluación y los días/cupos disponibles
- **THEN** el sistema crea la `Evaluacion` y habilita la estructura base para recibir reservas e importación de alumnos.
