#!/usr/bin/env python3
"""Seed the database with realistic employee data using bulk inserts."""

import argparse
import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session
from tqdm import tqdm

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal, create_tables  # noqa: E402
from app.models import Employee, EmploymentType  # noqa: E402

COUNTRIES = {
    "United States": ("USD", 60000, 200000),
    "United Kingdom": ("GBP", 35000, 120000),
    "India": ("INR", 500000, 2500000),
    "Germany": ("EUR", 45000, 130000),
    "Canada": ("CAD", 55000, 150000),
    "Australia": ("AUD", 65000, 160000),
    "France": ("EUR", 40000, 110000),
    "Japan": ("JPY", 4000000, 12000000),
    "Brazil": ("BRL", 80000, 300000),
    "Singapore": ("SGD", 60000, 180000),
    "Netherlands": ("EUR", 45000, 125000),
    "Spain": ("EUR", 30000, 90000),
    "Mexico": ("MXN", 300000, 1200000),
    "South Africa": ("ZAR", 250000, 900000),
    "United Arab Emirates": ("AED", 120000, 400000),
}

JOB_TITLES = [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Engineer",
    "Product Manager",
    "Data Scientist",
    "Data Analyst",
    "HR Specialist",
    "Recruiter",
    "Finance Analyst",
    "Accountant",
    "UX Designer",
    "DevOps Engineer",
    "QA Engineer",
    "Marketing Manager",
    "Sales Executive",
    "Customer Success Manager",
    "Business Analyst",
    "Operations Manager",
    "Legal Counsel",
    "Office Manager",
]

DEPARTMENTS = ["Engineering", "Product", "Data", "HR", "Finance"]

EMPLOYMENT_TYPES = list(EmploymentType)
BATCH_SIZE = 500


def load_names(filename: str) -> list[str]:
    path = Path(__file__).parent / filename
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def build_employee_record(first_names: list[str], last_names: list[str]) -> dict:
    country = random.choice(list(COUNTRIES.keys()))
    currency, min_salary, max_salary = COUNTRIES[country]
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    full_name = f"{random.choice(first_names)} {random.choice(last_names)}"

    return {
        "id": str(uuid.uuid4()),
        "full_name": full_name,
        "job_title": random.choice(JOB_TITLES),
        "department": random.choice(DEPARTMENTS),
        "country": country,
        "currency": currency,
        "salary": round(random.uniform(min_salary, max_salary), 2),
        "employment_type": random.choice(EMPLOYMENT_TYPES),
        "created_at": now,
        "updated_at": now,
    }


def seed(count: int) -> None:
    create_tables()
    db: Session = SessionLocal()

    try:
        existing = db.query(Employee).count()
        if existing > 0:
            print(f"Database already contains {existing} employees. Skipping seed.")
            return

        first_names = load_names("first_names.txt")
        last_names = load_names("last_names.txt")

        records = [
            build_employee_record(first_names, last_names)
            for _ in range(count)
        ]

        for start in tqdm(range(0, len(records), BATCH_SIZE), desc="Seeding employees"):
            batch = records[start : start + BATCH_SIZE]
            db.bulk_insert_mappings(Employee, batch)
            db.commit()

        print(f"Successfully seeded {count} employees.")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed employee salary data")
    parser.add_argument("--count", type=int, default=100, help="Number of employees to create")
    args = parser.parse_args()
    seed(args.count)


if __name__ == "__main__":
    main()
