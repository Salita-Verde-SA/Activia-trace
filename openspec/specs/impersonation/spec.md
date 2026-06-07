# impersonation Specification

## Purpose
TBD - created by archiving change c-05-audit-log. Update Purpose after archive.
## Requirements
### Requirement: Authorized Impersonation
The system SHALL allow users with the `impersonacion:usar` permission to temporarily operate on behalf of another user.

#### Scenario: Successful impersonation initiation
- **WHEN** a user with `impersonacion:usar` permission requests to impersonate a target user
- **THEN** the system generates a distinct impersonation session/token and logs `IMPERSONACION_INICIAR` in the audit log attributing the action to the impersonator

### Requirement: Audit Attribution under Impersonation
The system SHALL attribute all actions performed during an impersonation session to the real actor (the impersonator) in the audit log, while storing the target user as the `impersonado_id`.

#### Scenario: Action performed during impersonation
- **WHEN** an impersonating user performs a significant action
- **THEN** the audit log entry SHALL set `actor_id` to the impersonator's ID and `impersonado_id` to the target user's ID

