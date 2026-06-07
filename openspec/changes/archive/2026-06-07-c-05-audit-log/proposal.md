## Why

Activía Trace requires an immutable, reliable system to record all significant actions to provide a complete audit trail (the core value proposition implied by the name "trace"). Additionally, the system needs to support legitimate impersonation (e.g., for support or ADMINs operating on behalf of a user) with strict traceability, ensuring all actions are accurately attributed to the real actor.

## What Changes

- Add an `AuditLog` model (E-AUD) that is strictly append-only (updates and deletes must be rejected at both application and DB levels).
- Include fields: `actor`, `impersonado`, `materia`, `accion`, `detalle` (JSONB), `filas_afectadas`, `ip`, `user_agent`, `fecha_hora`.
- Implement a helper/decorator to standardize logging of actions with codes like `CALIFICACIONES_IMPORTAR`.
- Add impersonation tracking, requiring `impersonacion:usar` permission, making the session distinguishable, and logging `IMPERSONACION_INICIAR` / `IMPERSONACION_FINALIZAR`.
- Generate Alembic migration `003_audit_log`.

## Capabilities

### New Capabilities
- `audit-log`: Immutable tracking system for all significant application actions.
- `impersonation`: Mechanism for authorized users to temporarily operate on behalf of others while maintaining exact audit attribution.

### Modified Capabilities


## Impact

- **Database**: New `audit_log` table.
- **Backend Core**: New dependencies or middlewares to extract request context (IP, User-Agent) and handle impersonation tokens/headers.
- **Security**: Strict append-only constraints applied.
