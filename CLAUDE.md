# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository actually is

The **active project is `activia-trace`** — a multi-tenant academic-management and
traceability platform that sits as an orchestration layer over Moodle (consolidates
grades, detects delays, manages approved outbound communication, teaching teams,
encounters, colloquia, fee settlements and full audit). All live code is in
[backend/](backend/) (Python 3.13 / FastAPI) and [frontend/](frontend/) (React 19).

> ⚠️ **Dormant scaffolding — do not work here unless explicitly asked.** This repo was
> forked from the **JR Stack** template (a Go CLI installer), and that legacy still
> lives at the root: `cmd/`, `internal/`, `go.mod`, `go.sum`, `build.sh/.bat`, plus the
> JR-Stack-specific `README.md`, `AGENTS.md`, `ARCHITECTURE.md` and `CHANGES.md`. Its
> last commits predate all activia-trace work. **Ignore these for activia-trace tasks.**
> The activia-trace domain docs, by contrast, ARE current: [knowledge-base/](knowledge-base/),
> [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md), [docs/PRD.md](docs/PRD.md).

## Commands

All backend commands run from [backend/](backend/); all frontend commands from [frontend/](frontend/).

### Full stack (Docker)
```bash
docker compose up            # api :47121→8000, frontend :47120→5173, postgres :47122→5432, worker
```
`postgres` auto-runs [init-test-db.sql](init-test-db.sql), which creates the `activia_trace_test`
database the test suite needs.

### Backend
```bash
pip install -e ".[test]"                         # install with test extras (from backend/)
uvicorn app.main:app --reload                    # run API locally (needs reachable Postgres)
python -m workers.main                           # run the background worker standalone

pytest                                           # full test suite (asyncio_mode=auto, testpaths=tests)
pytest tests/test_tareas.py                      # one file
pytest tests/test_tareas.py::test_name           # one test
pytest -k "rbac and not slow"                    # by keyword

alembic upgrade head                             # apply migrations
alembic revision --autogenerate -m "msg"         # new migration (ONE per schema change)
alembic downgrade -1                             # roll back one

python -m scripts.seed_admin                     # dev seeds (also seed_rbac, seed_test_users)
```
**Tests require a real Postgres**, not mocks: [tests/conftest.py](backend/tests/conftest.py)
connects to `TEST_DATABASE_URL` (defaults to `DATABASE_URL`) and creates/drops all tables
per session. Mocking the DB is a hard rule violation. Copy [backend/.env.example](backend/.env.example)
to `backend/.env` first; `SECRET_KEY` and `ENCRYPTION_KEY` must be ≥32 chars.

### Frontend
```bash
npm install
npm run dev          # Vite dev server (5173)
npm run build        # tsc + vite build  ← only on explicit request
npm run lint         # eslint
npx vitest           # tests (no npm "test" script; jsdom + Testing Library, setupTests.ts)
npx vitest run src/features/tareas   # one path
```

## Backend architecture

Strict unidirectional layering — **Routers → Services → Repositories → Models**. Routers hold
no business logic; Services never touch the DB directly (always via a Repository).

- **Entrypoint** — [app/main.py](backend/app/main.py): builds the `FastAPI` app, a `lifespan`
  that starts logging/observability and the comunicaciones worker as a background task, CORS for
  `http://localhost:47120`, and mounts every router.
- **Router mounting is intentionally heterogeneous** (gotcha — read `main.py` before adding routes).
  Three router families coexist with *inconsistent* prefixes:
  - [api/routers/](backend/api/routers/) — `auth`, and `admin/{carreras,cohortes,materias}` under `/api/admin`
  - [api/v1/routers/](backend/api/v1/routers/) — `health`, `programas`, `fechas_academicas`
  - [api/endpoints/](backend/api/endpoints/) — the bulk of features, each mounted with its own prefix
    (e.g. `/api`, `/api/calificaciones`, `/api/v1/tareas`). New endpoints typically go here.
- **`core/`** — cross-cutting infra: [config.py](backend/core/config.py) (Pydantic `Settings`),
  [database.py](backend/core/database.py) (async engine/session), [dependencies.py](backend/core/dependencies.py)
  (`get_db`), [crypto.py](backend/core/crypto.py) (AES-256 for PII), [security/](backend/core/security/)
  (`jwt.py`, `password.py` Argon2), `tenancy.py`, `observability.py`, `audit.py`, `exceptions.py`.
  Note: `core/permissions.py` is a stub (`RESERVADO`) — real RBAC lives in the auth dependency below.

### Multi-tenancy + soft delete (enforced in the repository, not per-query)
[repositories/base.py](backend/repositories/base.py) `BaseRepository` is the backbone: its
`_base_query()` automatically filters by `tenant_id` and excludes soft-deleted rows
(`deleted_at IS NULL`); `create()` force-injects the context `tenant_id`; `delete()` does a
soft delete. Models compose this contract via [models/mixins.py](backend/models/mixins.py):
`TenantMixin` (FK to `tenant`, indexed), `SoftDeleteMixin`, `TimestampMixin`. A query that
bypasses `BaseRepository` and forgets the tenant scope is a row-level isolation bug.

### Identity & RBAC (the security golden rule)
[api/dependencies/auth.py](backend/api/dependencies/auth.py) is the single source of identity.
`get_current_user` extracts user id, `tenant_id`, and roles **only** from the verified JWT — never
from a URL/body/header. `require_permission("modulo:accion")` is the dependency every protected
endpoint declares (e.g. `Depends(require_permission("tareas:gestionar"))`); it checks two grant
paths in one `UNION` query — scoped roles via `Asignacion` (with `desde`/`hasta` validity windows)
and global roles via `UsuarioRol` — and is **fail-closed** (403 if the permission is not explicitly
granted). Services receive `current_user.tenant_id` and `current_user.id` and pass `tenant_id` into
their repositories.

### Workers & integrations
- [workers/comunicaciones.py](backend/workers/comunicaciones.py) drains the outbound-communication
  queue (`Pend→Send→OK/Fail` / `Pend→Canc`) using `SELECT ... FOR UPDATE SKIP LOCKED` for safe
  concurrency. It runs both inside the API process (lifespan task) and as the standalone `worker`
  compose service.
- [integrations/moodle_ws.py](backend/integrations/moodle_ws.py) — the dedicated Moodle Web
  Services client.
- **Migrations**: [alembic/env.py](backend/alembic/env.py) pulls the URL from `Settings.DATABASE_URL`
  and runs async; models are imported via the `models` package for autogenerate.

## Frontend architecture

Feature-based modules under [src/features/](frontend/src/features/) — `auth`, `tareas`, `calificaciones`,
`comunicaciones`, `coordinacion`, `finanzas`, `admin`, `alumno`, `avisos`, `equipos`, `programas`,
`shell`. Each feature is self-contained: `components/ hooks/ services/ types/ pages/`.

- **Composition**: [src/App.tsx](frontend/src/App.tsx) wires `QueryClientProvider` (TanStack Query) +
  `AuthProvider` + `BrowserRouter`; routing is role-based (`RoleBasedRedirect`, `react-router-dom` v7).
- **HTTP**: one Axios client in [src/shared/services/api.ts](frontend/src/shared/services/api.ts).
  A request interceptor attaches the `access_token` from `localStorage`; a response interceptor does
  **refresh-token rotation** with a queued-retry mechanism on 401. `baseURL` = `VITE_API_URL` or
  `http://localhost:47121`. All data fetching goes through feature `services/` + TanStack hooks — never
  call Axios from a component.
- **Forms**: React Hook Form + Zod. **Styles**: Tailwind CSS v4 (via `@tailwindcss/vite`). No `any`,
  no class components; PascalCase component files.

## Project rules & domain knowledge

The binding project rules (hard rules, governance levels, conventional-commit scopes, the OPSX
workflow) and the full domain model live outside this file:
- Domain source of truth: [knowledge-base/](knowledge-base/) (roles & RBAC in `03_actores_y_roles.md`,
  data model in `04_modelo_de_datos.md`, business rules `RN-XX` in `05_reglas_de_negocio.md`,
  open questions to resolve before coding in `10_preguntas_abiertas.md`).
- Architecture & product: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md), [docs/PRD.md](docs/PRD.md).

Codebase invariants enforced in review (read the KB for the rest): row-level multi-tenancy on every
table; identity always from the JWT session; RBAC `modulo:accion` fail-closed per endpoint; secrets/PII
(CBU, DNI) AES-256, passwords Argon2id; soft delete always (append-only audit, never hard delete);
Pydantic schemas use `model_config = ConfigDict(extra="forbid")`; snake_case Python; one Alembic
migration per schema change; ≤500 LOC per backend file, React components <200 LOC. Do not run
builds or commit without an explicit request.
