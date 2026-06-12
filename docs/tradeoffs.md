# Trade-offs — Employee Salary Management System

This document records deliberate decisions made during the build, with reasoning and alternatives considered.

## 1. Bulk insert over ORM loop in the seed script

**Decision:** Use `bulk_insert_mappings` in batches of 500 instead of `session.add(Employee(...))` per row.

**Why:** Seeding 10,000 employees with individual ORM inserts can take minutes; bulk insert completes in under a second on typical hardware. The seed script is a one-off data loader, not business logic — speed matters more than ORM convenience here.

**Trade-off:** No per-row SQLAlchemy events or automatic defaults; all fields must be populated in the dict. Acceptable for seed data.

**Alternative rejected:** Raw SQL `executemany` — slightly faster but loses SQLAlchemy table mapping and is harder to maintain.

---

## 2. Local currency storage instead of USD normalization

**Decision:** Store `salary` in each employee's local currency (USD, INR, GBP, etc.) without converting to a base currency.

**Why:** HR managers think in local terms ("₹15 lakh in India", "$120k in the US"). Normalizing to USD requires FX rates, date of conversion, and ongoing rate maintenance — out of scope for this assessment.

**Trade-off:** Org-wide `avg_salary` in the summary endpoint mixes currencies numerically. Documented as an informational limitation in `docs/requirements.md`.

**Alternative rejected:** Store USD equivalent + original amount — doubles schema complexity and implies FX accuracy we don't have.

---

## 3. SQLite instead of PostgreSQL

**Decision:** Use SQLite for development, demo, and tests.

**Why:** Zero infrastructure setup for reviewers; single file database; fast in-memory mode for pytest; sufficient for 10k rows with indexed filters and SQL aggregations.

**Trade-off:** No concurrent write scaling; limited analytics functions compared to PostgreSQL; not ideal for production multi-user HR systems.

**Alternative rejected:** PostgreSQL in Docker — adds setup friction for an assessment where data volume doesn't justify it.

---

## 4. Server-side search vs client-side filtering

**Decision:** Debounced search calls `GET /api/employees?search=...` rather than loading all employees into the browser.

**Why:** 10,000 rows cannot be held in browser memory with acceptable performance. Server-side `ILIKE` + pagination scales predictably.

**Trade-off:** Every keystroke (after debounce) hits the API. Mitigated by 300ms debounce and SQLite index on `country`.

**Alternative rejected:** Client-side filter on paginated data only — would miss matches on other pages.

---

## 5. Salary band computed at read time, not stored

**Decision:** `salary_band` (below / within / above) is computed from p25/p75 percentiles per `(country, job_title)` when listing employees.

**Why:** Bands stay accurate as peer salaries change; no migration or backfill when new employees are added.

**Trade-off:** List endpoint loads percentile map for all country/job-title groups. Cached in-memory per request — acceptable at 10k scale; would need materialized views or Redis at much larger scale.

**Alternative rejected:** Persist `salary_band` column — stale data risk and extra write logic on every peer salary change.

---

## 6. FastAPI over Django or Flask

**Decision:** FastAPI for the REST API layer.

**Why:** Native async-capable stack, automatic OpenAPI docs, Pydantic validation integrated, minimal boilerplate for a JSON API with no admin UI or templates.

**Trade-off:** No built-in admin, ORM, or auth — acceptable given explicit out-of-scope items.

See `docs/architecture.md` for a fuller comparison.

---

## 7. Fixed salary distribution buckets (0–50k, 50k–100k, …)

**Decision:** Salary distribution endpoint uses fixed numeric buckets in local currency.

**Why:** Simple to implement and test; matches assessment spec literally.

**Trade-off:** Buckets designed around USD-scale numbers are less intuitive for INR or JPY where most salaries fall in higher buckets. Documented limitation; country-specific bucket config could be a v2 improvement.
