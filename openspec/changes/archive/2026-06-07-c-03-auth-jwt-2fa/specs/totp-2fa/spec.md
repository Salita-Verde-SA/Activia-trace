## ADDED Requirements

### Requirement: TOTP Validation
The system SHALL support Time-Based One-Time Passwords (TOTP) for two-factor authentication.

#### Scenario: Login with 2FA enabled
- **WHEN** a user with 2FA enabled submits correct credentials
- **THEN** system returns a "pre-auth" token or status requiring 2FA instead of the final JWT

#### Scenario: Completing 2FA
- **WHEN** the user submits the valid pre-auth token and the correct 6-digit TOTP code
- **THEN** the system issues the final access JWT and refresh token

#### Scenario: Invalid 2FA code
- **WHEN** the user submits an incorrect 6-digit code
- **THEN** the system returns 401 Unauthorized and increments a rate-limit counter
