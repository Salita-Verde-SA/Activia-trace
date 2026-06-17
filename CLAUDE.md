# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Activia-trace** — multi-tenant academic management platform for UTN. Tracks students, grades, colloquia, communications, payroll, and audit logs.

Stack: Python 3.13 FastAPI (async) + PostgreSQL 15 + React 19 + TypeScript + Vite + Tailwind v4. Deployed via Docker Compose.

---

## Commands

### Docker (preferred)
```bash
docker-compose up          # all services: api:47121, frontend:47120, postgres:47122, worker
docker-compose up api      # backend only (postgres starts as dependency)
docker-compose up frontend # frontend only
docker-compose up worker   # background comunicaciones queue processor
```
Backend services read `./backend/.env`. The compose `api`/`worker`/`postgres` use the same `activia_trace` DB; the frontend container runs Vite dev (HMR) behind port 47120.

### Backend (manual)
```bash
cd backend
pip install -e ".[test]"   # base deps + pytest extras (omit [test] for runtime only)
alembic upgrade head       # apply migrations
uvicorn app.main:app --reload --port 8000
python -m workers.main     # run the background worker separately
```

Migrations:
```bash
alembic upgrade head       # apply all
alembic downgrade -1       # rollback one
alembic revision --autogenerate -m "description"  # generate from model changes
```

Tests (need a running Postgres — set `TEST_DATABASE_URL` in `.env`, else falls back to `DATABASE_URL`):
```bash
cd backend && pytest tests/
pytest tests/test_coloquios.py            # single file
pytest tests/test_coloquios.py::test_name # single test
```
`conftest.py` drops + recreates all tables from `Base.metadata` per session (no Alembic needed for tests); `asyncio_mode = auto`. `init-test-db.sql` seeds the test DB on first compose boot.

### Frontend (manual)
```bash
cd frontend
npm install
npm run dev    # Vite on port 5173
npm run lint   # ESLint
npx vitest                          # watch mode (no "test" npm script exists)
npx vitest run                      # single CI run
npx vitest run src/features/auth    # single feature
```

---

## Architecture

### Layers (backend)

```
backend/
  app/main.py          → FastAPI app, lifespan, CORS, router registration
  core/                → config, database session, dependencies, crypto, audit, observability
  models/              → SQLAlchemy ORM models (all inherit Base + mixins)
  models/mixins.py     → TenantMixin, TimestampMixin, SoftDeleteMixin (on every entity)
  schemas/             → Pydantic request/response models
  api/routers/         → auth.py + admin/ (carreras, cohortes, materias)
  api/endpoints/       → ~20 feature endpoint modules (analisis, coloquios, liquidaciones, …)
  api/dependencies/    → auth.py: get_current_user(), require_permission()
  integrations/        → moodle_ws.py (Moodle Web Services client)
  services/            → business logic (one service class per domain)
  repositories/        → data access (BaseRepository + specializations)
  workers/             → main.py loop + comunicaciones.py (outbound queue processor)
  alembic/versions/    → Alembic migrations (~24); one per schema change
```

### Critical invariants

**Multi-tenancy**: `tenant_id` is on every entity. Always derived from JWT payload, never from request params. All queries must filter by `tenant_id`.

**RBAC**: Roles are tenant-scoped. Permissions are global (`modulo:accion` strings). `Asignacion` adds time-bounded role assignment (`desde`/`hasta`); `UsuarioRol` is permanent. `require_permission()` checks both.

**Soft deletes**: `deleted_at` column on all entities. Never `DELETE`. Always filter `deleted_at IS NULL` in queries.

**Audit log**: `AuditLog` is append-only enforced by a DB trigger (prevents UPDATE/DELETE). Log every write action.

**Encrypted PII**: `EncryptedString` column type (see `core/crypto.py`) on `email`, `dni`, `cuil`, `cbu`, `alias`. Email also has a plaintext hash column for unique constraints.

**Identity from session**: Never trust user-supplied `user_id` or `tenant_id` in request body. Always extract from `get_current_user()`.

### Frontend structure

```
frontend/src/
  App.tsx              → providers + routing; RoleBasedRedirect routes by role
  features/            → one directory per domain
    [feature]/
      pages/           → route components
      components/      → UI components
      services/        → API calls (axios + react-query hooks)
      types/           → TypeScript interfaces
  shared/
    services/api.ts    → Axios instance with auth interceptors
    components/        → shared UI (modals, tables, etc.)
```

Role-based routing: ADMIN→monitor, FINANZAS→salarios, PROFESOR→calificaciones, ALUMNO→estado.

React Query is the server state layer. All data fetching goes through custom hooks wrapping `useQuery`/`useMutation`.

### Key domain models

| Model | Notes |
|---|---|
| `Usuario` | UUID PK; encrypted email/dni/cuil/cbu; TOTP 2FA |
| `Asignacion` | Time-bounded role (desde/hasta vigency window) |
| `AuditLog` | Immutable; tracks actor, impersonator, accion, detalle (JSON) |
| `Coloquio` | Exam event with quota enforcement; reserva system |
| `Comunicacion` | Outbound message queue; async worker processes it |
| `Aviso` | Multi-role notice with acknowledgment tracking |
| `Tarea` | Internal tutor↔coordinator task workflow |
| `Liquidacion` | Payroll period with salary grid |

### Adding a new feature

1. **Model**: add to `backend/models/`, inherit `Base + TenantMixin + TimestampMixin + SoftDeleteMixin`
2. **Migration**: `alembic revision --autogenerate -m "feat: description"` → review generated file
3. **Schema**: add request/response Pydantic models in `backend/schemas/`
4. **Repository**: extend `BaseRepository` or add query methods
5. **Service**: business logic; enforce tenant isolation here
6. **Endpoint**: add to `backend/api/endpoints/`; wire `require_permission()` dependency
7. **Register router**: in `app/main.py`
8. **Frontend**: new feature directory following the `pages/components/services/types` pattern; add route in `App.tsx`

### Ports

| Service | Docker port |
|---|---|
| Frontend (Vite) | 47120 |
| API (FastAPI) | 47121 |
| PostgreSQL | 47122 |

---

## Conventions

- Conventional commits only; never commit without explicit request
- All business rules and permission checks in the service layer, not endpoints
- `openspec/` is git-ignored (internal change management tooling)
- Knowledge base docs in Spanish in `knowledge-base/` — consult before implementing new domain logic
