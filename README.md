# Employee Salary Management System

A full-stack employee salary management tool for HR managers overseeing large, multi-country workforces. Browse and manage employee records, filter by country and job title, and view salary insights aggregated by geography and role.

## Prerequisites

- Python 3.11+ (3.12 recommended)
- Node.js 20+
- npm 10+

## Setup

### 1. Clone and enter the project

```bash
git clone <repository-url>
cd salary-management
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python seed/seed.py --count 100
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

### 3. Frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The UI runs at `http://localhost:5173`.

## Running Tests

### Backend

```bash
cd backend
pytest -v
```

Uses an in-memory SQLite database — fast and isolated.

### Frontend

```bash
cd frontend
npm test
```

## API Examples

List employees with pagination and filters:

```bash
curl "http://localhost:8000/api/employees?page=1&page_size=25&country=India&search=Patel"
```

Create an employee:

```bash
curl -X POST http://localhost:8000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "country": "United States",
    "currency": "USD",
    "salary": 120000,
    "employment_type": "FULL_TIME"
  }'
```

Country insights:

```bash
curl http://localhost:8000/api/insights/country/United%20States
```

Org summary:

```bash
curl http://localhost:8000/api/insights/summary
```

Salary distribution by country:

```bash
curl http://localhost:8000/api/insights/salary-distribution/United%20States
```

Top earners:

```bash
curl "http://localhost:8000/api/insights/top-earners?country=United%20States&limit=5"
```

Export employees as CSV:

```bash
curl -o employees.csv http://localhost:8000/api/employees/export/csv
```

## Architecture

- **Backend:** FastAPI + SQLAlchemy + SQLite with layered architecture (routers → services → models).
- **Frontend:** React + TypeScript + Vite + shadcn/ui + Tailwind CSS.
- **Tests:** pytest (backend), Vitest + React Testing Library (frontend).

See [docs/architecture.md](docs/architecture.md), [docs/requirements.md](docs/requirements.md), [docs/tradeoffs.md](docs/tradeoffs.md), [docs/seed-performance.md](docs/seed-performance.md), and [docs/ai-prompts.md](docs/ai-prompts.md) for details.

## Production Deployment (Manual)

### Option A — Separate processes

1. Deploy backend with `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
2. Build frontend: `cd frontend && npm run build`.
3. Serve `frontend/dist` with any static host (nginx, S3, etc.).
4. Set `VITE_API_URL` to your backend URL before building.

### Option B — Single process (FastAPI serves frontend)

1. `cd frontend && npm run build`
2. Start backend — if `frontend/dist` exists, FastAPI automatically serves the SPA.

Set environment variables from `.env.example`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLAlchemy database URL |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `VITE_API_URL` | Backend URL for frontend build |

## Seed Script

```bash
cd backend
python seed/seed.py --count 10000
```

- Default: 100 employees
- Idempotent: skips if data already exists
- Uses bulk inserts for performance

## Project Structure

```
salary-management/
├── backend/          # FastAPI application
├── frontend/         # React application
├── docs/             # Requirements and architecture
└── README.md
```
