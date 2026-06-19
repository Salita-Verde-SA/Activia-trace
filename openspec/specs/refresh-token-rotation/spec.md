# refresh-token-rotation Specification

## Purpose
TBD - created by archiving change c-03-auth-jwt-2fa. Update Purpose after archive.
## Requirements
### Requirement: Refresh Token Emission
The system SHALL issue a refresh token upon successful login to allow obtaining new access tokens without re-authenticating.

#### Scenario: Refreshing access token
- **WHEN** user submits a valid refresh token to `/api/auth/refresh`
- **THEN** system issues a new access JWT and a NEW refresh token
- **THEN** the old refresh token is marked as revoked

### Requirement: Refresh Token Reuse Detection
The system SHALL detect if a revoked refresh token is used again, indicating a potential token theft.

#### Scenario: Reusing a revoked refresh token
- **WHEN** an attacker or user submits a refresh token that has already been used/revoked
- **THEN** the system SHALL immediately revoke ALL active refresh tokens for that user
- **THEN** the system returns 401 Unauthorized, forcing the user to log in again

### Requirement: Rotación de refresh token con validación de blacklist
El sistema MUST validar que el refresh token presentado no esté en la blacklist antes de emitir un nuevo par de tokens. Si el token está revocado, se retorna 401.

#### Scenario: Refresh con token válido
- **WHEN** el cliente presenta un refresh token no expirado y no revocado
- **THEN** el sistema emite un nuevo access token y refresh token, e invalida el anterior

#### Scenario: Refresh con token revocado
- **WHEN** el cliente presenta un refresh token que fue invalidado por logout
- **THEN** el sistema retorna 401 Unauthorized sin emitir nuevos tokens

