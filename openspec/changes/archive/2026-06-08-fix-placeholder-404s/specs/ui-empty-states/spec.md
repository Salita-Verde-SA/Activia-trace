## ADDED Requirements

### Requirement: Frontend Placeholder Handling
The frontend services SHALL NOT emit HTTP requests for `materiaId` when its value is the global placeholder `00000000-0000-0000-0000-000000000000`. Instead, the fetching logic MUST resolve immediately with a valid empty/default response.

#### Scenario: Fetching Calificaciones Umbral with Placeholder
- **WHEN** the frontend requests the `umbral` for `00000000-0000-0000-0000-000000000000`
- **THEN** the API layer in the frontend resolves to `{ id: "", materia_id: "", porcentaje_requerido: 60 }` (or equivalent default) without making a network request.

#### Scenario: Fetching Analisis Atrasados with Placeholder
- **WHEN** the frontend requests the `atrasados` report for `00000000-0000-0000-0000-000000000000`
- **THEN** the API layer resolves to an empty `{ alumnos: [] }` array without making a network request.
