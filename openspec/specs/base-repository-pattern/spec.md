## ADDED Requirements

### Requirement: Base Repository Pattern
The system SHALL funnel all database interactions through a generic repository pattern that enforces global data rules (tenant scoping and soft deletion) uniformly.

#### Scenario: Instantiating a repository
- **WHEN** a repository is instantiated by a service
- **THEN** it MUST be initialized with an active `AsyncSession` and the current `tenant_id`

#### Scenario: Executing base operations
- **WHEN** the repository performs `get()`, `list()`, `create()`, `update()`, or `delete()`
- **THEN** it inherently applies `tenant_id` filters and `deleted_at` conditions without requiring explicit parameters from the calling service
