## ADDED Requirements

### Requirement: Forgot Password Token
The system SHALL allow users to request a password reset via email, generating a secure, short-lived, single-use token.

#### Scenario: Requesting recovery
- **WHEN** user requests recovery for a valid email
- **THEN** system generates a secure token, saves it, and simulates sending an email (until email worker is built)

### Requirement: Reset Password
The system SHALL allow resetting the password using the valid recovery token.

#### Scenario: Resetting password
- **WHEN** user submits the recovery token and a new password
- **THEN** the system updates the password hash
- **THEN** the recovery token is immediately invalidated
