## ADDED Requirements

### Requirement: CRUD operations for Carrera
The system SHALL provide administrative endpoints to create, read, update and list `Carrera` entities.

#### Scenario: Successful creation
- **WHEN** an ADMIN sends a valid request to create a `Carrera`
- **THEN** the system creates the `Carrera` and generates an `AuditLog` entry

#### Scenario: Uniqueness validation
- **WHEN** an ADMIN attempts to create a `Carrera` with a `codigo` that already exists in the same tenant
- **THEN** the system rejects the request with an HTTP 409 Conflict

### Requirement: Carrera status management
The system SHALL support activating and deactivating a `Carrera`.

#### Scenario: Deactivating a Carrera
- **WHEN** an ADMIN deactivates a `Carrera`
- **THEN** its status changes to `Inactiva`
