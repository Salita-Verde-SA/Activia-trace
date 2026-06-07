## MODIFIED Requirements

### Requirement: Role assignment intersection
Un usuario PUEDE tener múltiples roles asignados en un mismo tenant a través de registros de `Asignacion`. La resolución de permisos DEBE devolver la unión (OR lógico) de todos los permisos otorgados a los roles que estén **activos** (donde la fecha actual se encuentre dentro del rango `desde`/`hasta` de la asignación y la asignación no esté lógicamente eliminada).

#### Scenario: Multiple roles evaluation
- **WHEN** un usuario con roles PROFESOR y TUTOR intenta realizar una acción
- **THEN** el sistema evalúa favorablemente si la acción pertenece a la lista combinada de permisos de ambos roles, asumiendo que ambas asignaciones están vigentes.

#### Scenario: Expired role evaluation
- **WHEN** un usuario intenta realizar una acción que solo permite el rol TUTOR, pero su asignación como TUTOR tiene fecha `hasta` en el pasado
- **THEN** el sistema evalúa negativamente (403 Forbidden) ya que la asignación no está activa.
