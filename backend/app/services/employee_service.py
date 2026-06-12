import csv
import io
import uuid
from collections.abc import Generator
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeListItem, EmployeeRead, EmployeeUpdate
from app.services import insights_service
from app.services.salary_utils import classify_salary_band


def create_employee(db: Session, payload: EmployeeCreate) -> Employee:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    employee = Employee(
        id=str(uuid.uuid4()),
        **payload.model_dump(),
        created_at=now,
        updated_at=now,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def get_employee(db: Session, employee_id: str) -> Employee | None:
    return db.query(Employee).filter(Employee.id == employee_id).first()


def _build_filtered_query(
    db: Session,
    *,
    country: str | None = None,
    job_title: str | None = None,
    search: str | None = None,
):
    query = db.query(Employee)

    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title == job_title)
    if search:
        query = query.filter(Employee.full_name.ilike(f"%{search}%"))

    return query


def list_employees(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 25,
    country: str | None = None,
    job_title: str | None = None,
    search: str | None = None,
) -> tuple[list[EmployeeListItem], int]:
    query = _build_filtered_query(db, country=country, job_title=job_title, search=search)

    total = query.with_entities(func.count(Employee.id)).scalar() or 0
    employees = (
        query.order_by(Employee.full_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    percentile_map = insights_service.get_job_title_percentile_map(db)
    items: list[EmployeeListItem] = []

    for employee in employees:
        p25, p75 = percentile_map.get((employee.country, employee.job_title), (employee.salary, employee.salary))
        salary_band = classify_salary_band(employee.salary, p25, p75).value
        base = EmployeeRead.model_validate(employee)
        items.append(EmployeeListItem(**base.model_dump(), salary_band=salary_band))

    return items, total


def iter_employees_csv(
    db: Session,
    *,
    country: str | None = None,
    job_title: str | None = None,
    search: str | None = None,
) -> Generator[str, None, None]:
    query = _build_filtered_query(db, country=country, job_title=job_title, search=search)
    employees = query.order_by(Employee.full_name).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "id",
            "full_name",
            "job_title",
            "department",
            "country",
            "currency",
            "salary",
            "employment_type",
            "created_at",
            "updated_at",
        ]
    )
    yield buffer.getvalue()
    buffer.seek(0)
    buffer.truncate(0)

    for employee in employees:
        writer.writerow(
            [
                employee.id,
                employee.full_name,
                employee.job_title,
                employee.department,
                employee.country,
                employee.currency,
                employee.salary,
                employee.employment_type.value,
                employee.created_at.isoformat(),
                employee.updated_at.isoformat(),
            ]
        )
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)


def update_employee(db: Session, employee: Employee, payload: EmployeeUpdate) -> Employee:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    employee.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee: Employee) -> None:
    db.delete(employee)
    db.commit()
