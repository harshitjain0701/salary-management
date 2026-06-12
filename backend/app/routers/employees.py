from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeListResponse, EmployeeRead, EmployeeUpdate
from app.services import employee_service

router = APIRouter(tags=["employees"])


@router.get("/employees", response_model=EmployeeListResponse)
def list_employees(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    country: str | None = None,
    job_title: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    items, total = employee_service.list_employees(
        db,
        page=page,
        page_size=page_size,
        country=country,
        job_title=job_title,
        search=search,
    )
    return EmployeeListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/employees", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(db, payload)


@router.get("/employees/{employee_id}", response_model=EmployeeRead)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = employee_service.get_employee(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


@router.put("/employees/{employee_id}", response_model=EmployeeRead)
def update_employee(employee_id: str, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = employee_service.get_employee(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee_service.update_employee(db, employee, payload)


@router.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = employee_service.get_employee(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    employee_service.delete_employee(db, employee)
