## ADDED Requirements

### Requirement: CRUD operations for Cohorte
The system SHALL provide administrative endpoints to create, read, update and list `Cohorte` entities associated with a `Carrera`.

#### Scenario: Successful creation
- **WHEN** an ADMIN sends a valid request to create a `Cohorte` for an active `Carrera`
- **THEN** the system creates the `Cohorte` and generates an `AuditLog` entry

#### Scenario: Uniqueness validation
- **WHEN** an ADMIN attempts to create a `Cohorte` with a `nombre` that already exists for the same `Carrera` in the same tenant
- **THEN** the system rejects the request with an HTTP 409 Conflict

### Requirement: Active Carrera constraint
The system SHALL reject the creation or opening of a `Cohorte` if its associated `Carrera` is inactive.

#### Scenario: Creating a Cohorte in an inactive Carrera
- **WHEN** an ADMIN attempts to create an open `Cohorte` for a `Carrera` with status `Inactiva`
- **THEN** the system rejects the request with an HTTP 400 Bad Request
