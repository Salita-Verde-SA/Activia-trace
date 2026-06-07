# auth-rate-limiting Specification

## Purpose
TBD - created by archiving change c-03-auth-jwt-2fa. Update Purpose after archive.
## Requirements
### Requirement: Auth Rate Limiting
The system SHALL restrict the number of login and recovery attempts to prevent brute-force attacks.

#### Scenario: Triggering rate limit
- **WHEN** a client makes more than 5 failed login attempts from the same IP/email within 60 seconds
- **THEN** the system returns 429 Too Many Requests for subsequent attempts

