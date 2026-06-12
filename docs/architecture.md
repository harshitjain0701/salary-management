# Architecture — Employee Salary Management System

## Overview

Monorepo with a Python FastAPI backend and a React (Vite) frontend. The backend exposes a JSON REST API under `/api`. The frontend communicates via a thin API client layer.

```
salary-management/
├── backend/          # FastAPI + SQLAlchemy + SQLite
├── frontend/         # React + Vite + shadcn/ui
└── docs/             # Requirements, architecture, trade-offs, AI notes
```

## Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Tier — React SPA (frontend/)              │
│  Pages, components, API client, form validation         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────▼──────────────────────────────┐
│  Application Tier — FastAPI (backend/app/)                │
│  Routers → Services → Pydantic schemas                    │
└──────────────────────────┬──────────────────────────────┘
                           │ SQLAlchemy ORM
┌──────────────────────────▼──────────────────────────────┐
│  Data Tier — SQLite (salary_management.db)              │
│  Employee table, indexes on country                     │
└─────────────────────────────────────────────────────────┘
```

| Tier | Responsibility | Key files |
|------|----------------|-----------|
| Presentation | UI, user input, loading/error states | `frontend/src/pages/`, `components/` |
| Application | HTTP, validation, business rules, aggregations | `routers/`, `services/`, `schemas.py` |
| Data | Persistence, queries | `models.py`, `database.py` |

Tests bypass the presentation tier and hit the application tier via FastAPI `TestClient` with an in-memory SQLite database.

## Why FastAPI over Django or Flask?

| Framework | Fit for this project |
|-----------|---------------------|
| **FastAPI** ✓ | Automatic OpenAPI docs, Pydantic validation, thin API layer, no unused admin/auth stack |
| Django | Excellent for full-stack apps with admin and ORM conventions; heavy for a JSON-only API with no auth |
| Flask | Minimal but lacks built-in validation/docs; would need extensions (Marshmallow, flask-restx) |

FastAPI aligns with the assessment scope: a focused REST API with typed request/response models and `/docs` for reviewers.

## Why SQLite?

- **Zero setup** — no database server install for reviewers
- **File-based** — easy to reset (`rm salary_management.db`) and re-seed
- **Fast tests** — in-memory SQLite in pytest
- **Sufficient scale** — 10k rows with pagination and SQL aggregates perform well

Trade-offs (concurrent writes, production HA) are documented in [tradeoffs.md](tradeoffs.md).

## Backend Layers

```
HTTP Request
    ↓
Routers (app/routers/)     — Route definitions, status codes, StreamingResponse
    ↓
Services (app/services/)   — Business logic, queries, aggregations, salary bands
    ↓
Models (app/models.py)     — SQLAlchemy ORM entities
    ↓
SQLite database
```

| File | Role |
|------|------|
| `app/main.py` | FastAPI app, CORS, lifespan, optional static mount |
| `app/database.py` | Engine, session factory, `get_db` dependency |
| `app/models.py` | `Employee` ORM model |
| `app/schemas.py` | Pydantic request/response models |
| `app/routers/employees.py` | CRUD + CSV export |
| `app/routers/insights.py` | Insights and lookup endpoints |
| `app/services/employee_service.py` | CRUD, CSV streaming, salary band on list |
| `app/services/insights_service.py` | Aggregations, percentiles, distributions |
| `app/services/salary_utils.py` | Percentile and bucket helpers |

## API Surface

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/employees` | List with pagination, filters, `salary_band` |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/export/csv` | CSV download (StreamingResponse) |
| GET | `/api/employees/{id}` | Get single employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/insights/country/{country}` | Country salary insights + p25/p75 on top titles |
| GET | `/api/insights/job-title` | Avg salary by job title (optional country filter) |
| GET | `/api/insights/summary` | Org-wide summary |
| GET | `/api/insights/salary-distribution/{country}` | Salary range buckets |
| GET | `/api/insights/top-earners` | Top N earners (`country`, `limit`) |
| GET | `/api/insights/department-summary` | Headcount and avg salary per department |
| GET | `/api/countries` | Distinct countries |
| GET | `/api/job-titles` | Distinct job titles |

Interactive API docs: `/docs` (Swagger UI).

## Salary Band Logic

For each `(country, job_title)` group:

1. Collect all salaries in that group
2. Compute **p25** and **p75** using inclusive quartiles
3. Classify each employee:
   - `below_band` — salary < p25
   - `within_band` — p25 ≤ salary ≤ p75
   - `above_band` — salary > p75

Returned on `GET /api/employees` as `salary_band`. Shown as colored badges in the React employee table.

## Frontend Structure

```
src/
├── api/client.ts
├── components/
│   ├── EmployeeTable.tsx      # Table + salary band badges
│   ├── EmployeeForm.tsx
│   └── InsightsDashboard.tsx
├── pages/
│   ├── EmployeesPage.tsx
│   └── InsightsPage.tsx
└── App.tsx
```

## Test Strategy

- **Backend:** pytest + in-memory SQLite; 20 integration tests covering CRUD, insights, CSV, salary bands
- **Frontend:** Vitest + RTL for form schema and table rendering

## Related Docs

- [requirements.md](requirements.md) — scope and data model
- [tradeoffs.md](tradeoffs.md) — decision rationale
- [seed-performance.md](seed-performance.md) — bulk insert benchmarks
- [ai-prompts.md](ai-prompts.md) — Cursor prompt log

## Deployment (Manual)

1. **Backend:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. **Frontend (dev):** `npm run dev`
3. **Production:** `npm run build` → serve `frontend/dist` via FastAPI static mount or separate host
