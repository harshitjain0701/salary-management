from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import EmploymentType

SalaryBandValue = Literal["below_band", "within_band", "above_band"]


class EmployeeBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    job_title: str = Field(min_length=1, max_length=255)
    department: str = Field(min_length=1, max_length=255)
    country: str = Field(min_length=1, max_length=255)
    currency: str = Field(min_length=3, max_length=3)
    salary: float = Field(gt=0)
    employment_type: EmploymentType

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        return value.upper()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    department: Optional[str] = Field(default=None, min_length=1, max_length=255)
    country: Optional[str] = Field(default=None, min_length=1, max_length=255)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    salary: Optional[float] = Field(default=None, gt=0)
    employment_type: Optional[EmploymentType] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.upper()


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class EmployeeListItem(EmployeeRead):
    salary_band: SalaryBandValue | None = None


class EmployeeListResponse(BaseModel):
    items: list[EmployeeListItem]
    total: int
    page: int
    page_size: int


(BaseModel):
    job_title: str
    avg_salary: float
    headcount: int
    p25_salary: float | None = None
    p75_salary: float | None = None
