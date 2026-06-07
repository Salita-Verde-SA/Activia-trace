## ADDED Requirements

### Requirement: PII Encryption in Rest
The system SHALL encrypt all personally identifiable information (PII) marked as `[cifrado]` before storing it in the database, and decrypt it transparently upon retrieval.

#### Scenario: Saving a record with PII
- **WHEN** a model with an encrypted column (e.g. DNI) is saved
- **THEN** the value is stored in the database as an AES-256 ciphertext using the system's `ENCRYPTION_KEY`

#### Scenario: Retrieving a record with PII
- **WHEN** a model with an encrypted column is retrieved from the database
- **THEN** the ciphertext is automatically decrypted into plaintext for application use

#### Scenario: Database dump exposure
- **WHEN** the raw database rows are inspected
- **THEN** the PII values appear as undecipherable binary/text tokens, protecting user privacy
