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
