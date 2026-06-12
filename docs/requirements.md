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
