## ADDED Requirements

### Requirement: Immutable Audit Logging
The system SHALL support an append-only AuditLog mechanism where significant actions are recorded without the possibility of being updated or deleted by the application or standard database operations.

#### Scenario: Successful audit entry
- **WHEN** a significant action occurs
- **THEN** the system creates a new AuditLog record containing the actor_id, IP, User-Agent, and JSON details

#### Scenario: Attempt to update audit log
- **WHEN** an update operation is executed against the audit_log table
- **THEN** the database trigger SHALL reject the operation and raise an exception

#### Scenario: Attempt to delete audit log
- **WHEN** a delete operation is executed against the audit_log table
- **THEN** the database trigger SHALL reject the operation and raise an exception
