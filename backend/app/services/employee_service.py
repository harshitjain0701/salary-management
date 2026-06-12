import uuid
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeUpdate


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


def list_employees(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 25,
    country: str | None = None,
    job_title: str | None = None,
    search: str | None = None,
) -> tuple[list[Employee], int]:
    query = db.query(Employee)

    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title == job_title)
    if search:
        query = query.filter(Employee.full_name.ilike(f"%{search}%"))

    total = query.with_entities(func.count(Employee.id)).scalar() or 0
    items = (
        query.order_by(Employee.full_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


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
