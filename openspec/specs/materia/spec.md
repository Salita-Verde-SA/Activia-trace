## ADDED Requirements

### Requirement: CRUD operations for Materia
The system SHALL provide administrative endpoints to create, read, update and list `Materia` entities as a centralized catalog per tenant.

#### Scenario: Successful creation
- **WHEN** an ADMIN sends a valid request to create a `Materia`
- **THEN** the system creates the `Materia` and generates an `AuditLog` entry

#### Scenario: Uniqueness validation
- **WHEN** an ADMIN attempts to create a `Materia` with a `codigo` that already exists in the same tenant
- **THEN** the system rejects the request with an HTTP 409 Conflict
