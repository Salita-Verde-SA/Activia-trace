## Context

Active-Trace is a multi-tenant platform that manages sensitive academic and financial data. To maintain accountability, we must record significant system operations in a tamper-proof way. Furthermore, support and admin users occasionally need to impersonate standard users for debugging. This impersonation must be transparent in the audit trail, attributing actions to the real user while affecting the data of the impersonated user.

## Goals / Non-Goals

**Goals:**
- Provide a structured, globally consistent `AuditLog` table.
- Enforce append-only semantics at both the application and database level.
- Standardize the method for injecting audit events into the database.
- Establish a clear mechanism for impersonation that securely attributes actions in the audit log.

**Non-Goals:**
- Building a full Event Sourcing architecture (we are only auditing significant domain events, not every CRUD).
- Designing the UI for the audit log viewer (this is part of the frontend change).

## Decisions

1. **AuditLog Data Model**: 
   - Uses `fecha_hora`, `actor_id` (real user), `impersonado_id` (optional, target user), `tenant_id`, `materia_id` (optional), `accion` (string constant), `detalle` (JSONB), `filas_afectadas`, `ip`, and `user_agent`.
   - The model will explicitly omit `updated_at` and `deleted_at`.
2. **Database-level Append-Only Guarantee**:
   - We will implement a PostgreSQL trigger function (`prevent_update_delete_audit`) bound to the `audit_log` table that raises an exception on `UPDATE` or `DELETE` operations.
3. **Impersonation State Management**:
   - Impersonation will be represented via a special JWT claim `impersonator_id`. The standard `sub` claim will represent the `impersonado` (target user).
   - The `get_current_user` dependency will extract `impersonator_id` and include it in the `CurrentUser` struct, making it universally available to the audit logger.
4. **Audit Logger Dependency**:
   - We will provide an `AuditService` or injected dependency `audit_logger` that wraps `Session.add(AuditLog(...))` to standardize the extraction of IP, User-Agent, and user context.

## Risks / Trade-offs

- **Risk**: The database trigger might interfere with automated data purges (if ever required for compliance).
  - **Mitigation**: Any legal requirement to purge data (e.g., GDPR right to be forgotten) will require the DBA to temporarily disable the trigger or use a specific administrative role bypassing the trigger.
- **Risk**: Bloating the database with too many JSONB payloads.
  - **Mitigation**: The specification mandates logging only *significant* actions (e.g., `CALIFICACIONES_IMPORTAR`), not every GET request.
