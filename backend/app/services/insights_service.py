from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Employee
from app.schemas import CountryBreakdown, CountryInsights, JobTitleInsight, OrgSummary


def get_country_insights(db: Session, country: str) -> CountryInsights | None:
    stats = (
        db.query(
            func.count(Employee.id).label("headcount"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .filter(Employee.country == country)
        .one()
    )

    if stats.headcount == 0:
        return None

    top_titles_rows = (
        db.query(
            Employee.job_title,
            func.count(Employee.id).label("headcount"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .filter(Employee.country == country)
        .group_by(Employee.job_title)
        .order_by(func.count(Employee.id).desc(), Employee.job_title)
        .limit(5)
        .all()
    )

    return CountryInsights(
        country=country,
        headcount=stats.headcount,
        min_salary=float(stats.min_salary),
        max_salary=float(stats.max_salary),
        avg_salary=float(stats.avg_salary),
        top_job_titles=[
            JobTitleInsight(
                job_title=row.job_title,
                headcount=row.headcount,
                avg_salary=float(row.avg_salary),
            )
            for row in top_titles_rows
        ],
    )


def get_job_title_insights(db: Session, country: str | None = None) -> list[JobTitleInsight]:
    query = db.query(
        Employee.job_title,
        func.count(Employee.id).label("headcount"),
        func.avg(Employee.salary).label("avg_salary"),
    )
    if country:
        query = query.filter(Employee.country == country)

    rows = query.group_by(Employee.job_title).order_by(Employee.job_title).all()
    return [
        JobTitleInsight(
            job_title=row.job_title,
            headcount=row.headcount,
            avg_salary=float(row.avg_salary),
        )
        for row in rows
    ]


def get_org_summary(db: Session) -> OrgSummary:
    total_headcount = db.query(func.count(Employee.id)).scalar() or 0
    avg_salary = float(db.query(func.avg(Employee.salary)).scalar() or 0)

    breakdown_rows = (
        db.query(
            Employee.country,
            func.count(Employee.id).label("headcount"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .group_by(Employee.country)
        .order_by(Employee.country)
        .all()
    )

    return OrgSummary(
        total_headcount=total_headcount,
        avg_salary=avg_salary,
        country_count=len(breakdown_rows),
        country_breakdown=[
            CountryBreakdown(
                country=row.country,
                headcount=row.headcount,
                avg_salary=float(row.avg_salary),
            )
            for row in breakdown_rows
        ],
    )


def get_distinct_countries(db: Session) -> list[str]:
    rows = db.query(Employee.country).distinct().order_by(Employee.country).all()
    return [row[0] for row in rows]


def get_distinct_job_titles(db: Session) -> list[str]:
    rows = db.query(Employee.job_title).distinct().order_by(Employee.job_title).all()
    return [row[0] for row in rows]
