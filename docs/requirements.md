# Requirements — Employee Salary Management System

## Goal

Build a full-stack employee salary management tool for an HR manager overseeing approximately 10,000 employees across multiple countries. The system enables browsing, searching, and filtering employees; creating, updating, and deleting employee records; and viewing salary insights aggregated by country and job title. The product prioritizes code quality, test coverage, and maintainability as part of a software craftsmanship assessment.

## In Scope

- **Employee CRUD** — Create, read, update, and delete employee records via a REST API and React UI.
- **Employee listing** — Paginated table with filters for country and job title, plus debounced search on employee name (server-side for scalability).
- **Insights** — Country-level min/max/average salary, headcount, and top job titles; average salary by job title (optionally filtered by country); org-wide summary with country breakdown; salary distribution buckets; top earners; department summary; p25/p75 percentiles per job title in a country.
- **Salary bands** — Each employee in the list response includes a computed `salary_band` (`below_band`, `within_band`, `above_band`) based on p25/p75 for their country and job title; displayed as colored badges in the UI.
- **CSV export** — `GET /api/employees/export/csv` streams current employee data as a downloadable CSV file.
- **Lookup endpoints** — Distinct country and job title lists for UI dropdowns.
- **Seed script** — Bulk-insert realistic sample data with configurable count for development and demos.
- **Automated tests** — pytest for backend services and endpoints; Vitest + React Testing Library for frontend components.
- **Documentation** — Requirements, architecture notes, trade-offs, seed performance, AI prompt log, and README with setup instructions.

## Deliberately Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / login | Adds security complexity not required for this assessment; single HR Manager persona assumed. |
| Payroll processing / payslip generation | System stores salary data only; it is not a payroll engine. |
| Salary history / audit trail | Valuable for production but not required; can be added in a future iteration. |
| Bulk CSV import UI | Seed script satisfies data-loading needs for development and testing. |
| Role-based permissions | Single user role (HR Manager); no multi-role access control needed. |
| Real-time notifications | No async event system or push notifications in scope. |

## Data Model Decisions

- **Primary key:** UUID — avoids sequential ID leakage and supports distributed-friendly IDs.
- **full_name:** Single string field (not split first/last) for simplicity in listing and search.
- **department:** String field grouping employees (Engineering, Product, Data, HR, Finance).
- **country:** ISO-style country name (e.g. "United States", "India") — human-readable for HR users.
- **currency:** 3-character ISO 4217 code (USD, INR, GBP) stored on each record. Derived from country during seeding but editable on create/update for flexibility.
- **salary:** Float stored in **local currency** for the employee's country — no FX conversion in v1.
- **employment_type:** Enum — `FULL_TIME`, `PART_TIME`, `CONTRACT`.
- **Timestamps:** `created_at` and `updated_at` on every record for basic lifecycle tracking (not a full audit trail).
- **salary_band (computed):** Not stored in the database. Derived at read time from p25/p75 salary percentiles for the employee's `(country, job_title)` peer group.

### Known Limitation

Org-wide average salary in the summary endpoint aggregates numeric salary values across currencies without conversion. This metric is informational only and is documented as a demo limitation.

## Non-Functional Decisions

- **Architecture:** Layered clean architecture — routers (HTTP) → services (business logic) → SQLAlchemy models (persistence).
- **Database:** SQLite for simplicity; separate in-memory SQLite for tests (fast, deterministic, no file I/O).
- **TDD:** Write failing tests before implementing service and endpoint logic.
- **Performance:** Insights use SQL aggregations (`MIN`, `MAX`, `AVG`, `COUNT`, `GROUP BY`) — no N+1 queries or Python-side loops over large result sets.
- **Seed performance:** Bulk insert via `bulk_insert_mappings`; target < 5 seconds for 100 records.
- **API conventions:** Proper HTTP status codes (201 create, 204 delete, 404 not found, 422 validation error).
- **Frontend:** React + TypeScript + shadcn/ui; debounced server-side search; 25 rows per page; loading and error states on all API calls.
- **Deployment:** Manual setup documented in README (uvicorn + Vite dev server locally; optional static build served by FastAPI for simple production).
