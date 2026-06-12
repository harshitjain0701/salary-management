from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    CountryInsights,
    DepartmentSummary,
    JobTitleInsight,
    OrgSummary,
    SalaryDistribution,
    TopEarner,
)
from app.services import insights_service

router = APIRouter(tags=["insights"])


@router.get("/insights/country/{country}", response_model=CountryInsights)
def get_country_insights(country: str, db: Session = Depends(get_db)):
    insights = insights_service.get_country_insights(db, country)
    if insights is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No employees found for country")
    return insights


@router.get("/insights/job-title", response_model=list[JobTitleInsight])
def get_job_title_insights(country: str | None = Query(default=None), db: Session = Depends(get_db)):
    return insights_service.get_job_title_insights(db, country=country)


@router.get("/insights/summary", response_model=OrgSummary)
def get_org_summary(db: Session = Depends(get_db)):
    return insights_service.get_org_summary(db)


@router.get("/insights/salary-distribution/{country}", response_model=SalaryDistribution)
def get_salary_distribution(country: str, db: Session = Depends(get_db)):
    distribution = insights_service.get_salary_distribution(db, country)
    if distribution is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No employees found for country")
    return distribution


@router.get("/insights/top-earners", response_model=list[TopEarner])
def get_top_earners(
    country: str | None = Query(default=None),
    limit: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return insights_service.get_top_earners(db, country=country, limit=limit)


@router.get("/insights/department-summary", response_model=list[DepartmentSummary])
def get_department_summary(db: Session = Depends(get_db)):
    return insights_service.get_department_summary(db)


@router.get("/countries", response_model=list[str])
def get_countries(db: Session = Depends(get_db)):
    return insights_service.get_distinct_countries(db)


@router.get("/job-titles", response_model=list[str])
def get_job_titles(db: Session = Depends(get_db)):
    return insights_service.get_distinct_job_titles(db)
