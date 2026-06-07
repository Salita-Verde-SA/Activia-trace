## ADDED Requirements

### Requirement: Transversal Soft Delete
The system SHALL never physically delete records from the database. Instead, it MUST mark them as deleted using a timestamp, preserving the historical data for auditing and recovery.

#### Scenario: Deleting a record
- **WHEN** a repository executes a delete operation on a record
- **THEN** the system updates the `deleted_at` column with the current timestamp instead of removing the row from the database

#### Scenario: Querying active records
- **WHEN** a repository queries a list of records
- **THEN** the system automatically filters out any records where `deleted_at` is not null
