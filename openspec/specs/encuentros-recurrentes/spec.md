# encuentros-recurrentes Specification

## Purpose
TBD - created by archiving change c-13-encuentros-y-guardias. Update Purpose after archive.
## Requirements
### Requirement: Generación de encuentros recurrentes
El sistema SHALL permitir definir un patrón de repetición (slot) semanal (día y franja horaria) y generar automáticamente las instancias proyectadas.

#### Scenario: Creación exitosa de slot recurrente
- **WHEN** un rol autorizado crea un encuentro recurrente indicando día, hora, materia y número de semanas
- **THEN** el sistema crea un `SlotEncuentro` y tantas `InstanciaEncuentro` como semanas indicadas, calculando la fecha exacta de cada una.

#### Scenario: Encuentro único
- **WHEN** el usuario selecciona crear un encuentro de única vez indicando una fecha concreta
- **THEN** el sistema genera una única `InstanciaEncuentro` vinculada al contexto, sin generar instancias a futuro.

