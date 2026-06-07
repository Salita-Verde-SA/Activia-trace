## ADDED Requirements

### Requirement: Email and Password Login
The system SHALL authenticate users against their email and hashed password (Argon2id).

#### Scenario: Successful login
- **WHEN** user provides correct email and password
- **THEN** system returns a short-lived access JWT and a refresh token

#### Scenario: Invalid credentials
- **WHEN** user provides incorrect password or non-existent email
- **THEN** system returns 401 Unauthorized with generic "Credenciales inválidas" message (no email enumeration)

### Requirement: Central Identity Resolution
The system SHALL resolve the user identity strictly from the verified JWT token via a central dependency.

#### Scenario: Resolving identity
- **WHEN** an authenticated endpoint is accessed with a valid JWT
- **THEN** the system extracts `user_id` and `tenant_id` exclusively from the token payload to establish context
