## ADDED Requirements

### Requirement: RBAC Entities Definition
El sistema DEBE contar con tablas para Roles, Permisos y la Matriz de Rol-Permiso (`RolPermiso`). Estas tablas deben ser scopeables por tenant (si corresponde para customización) o globales con la matriz base.

#### Scenario: Database schema generation
- **WHEN** las migraciones de base de datos se ejecutan
- **THEN** las tablas `roles`, `permisos` y `roles_permisos` son creadas junto con los registros iniciales (seed data).

### Requirement: Role assignment intersection
Un usuario PUEDE tener múltiples roles asignados en un mismo tenant. La resolución de permisos DEBE devolver la unión (OR lógico) de todos los permisos otorgados a esos roles.

#### Scenario: Multiple roles evaluation
- **WHEN** un usuario con roles PROFESOR y TUTOR intenta realizar una acción
- **THEN** el sistema evalúa favorablemente si la acción pertenece a la lista combinada de permisos de ambos roles.
