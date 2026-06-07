## ADDED Requirements

### Requirement: Row-level Tenant Isolation
The system SHALL ensure that all data access operations are inherently scoped to the currently active tenant, preventing any cross-tenant data leakage.

#### Scenario: Querying data within a tenant
- **WHEN** a repository queries data for tenant A
- **THEN** the system only returns records where `tenant_id` equals tenant A's ID
- **THEN** records from tenant B are entirely invisible

#### Scenario: Creating data within a tenant
- **WHEN** a repository creates a new record
- **THEN** the system automatically assigns the active `tenant_id` to the record
