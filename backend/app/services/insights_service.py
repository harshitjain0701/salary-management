from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Employee
from app.schemas import (
    CountryBreakdown,
    CountryInsights,
    DepartmentSummary,
    JobTitleInsight,
    OrgSummary,
    SalaryDistribution,
    SalaryDistributionBucket,
    TopEarner,
)
from app.services.salary_utils import (
    build_salary_buckets,
    classify_salary_band,
    compute_percentiles,
)


def get_job_title_percentile_map(db: Session, country: str | None = None) -> dict[tuple[str, str], tuple[float, float]]:
    query = db.query(Employee.country, Employee.job_title, Employee.salary)
    if country:
        query = query.filter(Employee.country == country)

    grouped: dict[tuple[str, str], list[float]] = {}
    for row_country, row_title, row_salary in query.all():
        key = (row_country, row_title)
        grouped.setdefault(key, []).append(float(row_salary))

    return {key: compute_percentiles(salaries) for key, salaries in grouped.items()}


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

    percentile_map = get_job_title_percentile_map(db, country=country)

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
                p25_salary=percentile_map.get((country, row.job_title), (None, None))[0],
                p75_salary=percentile_map.get((country, row.job_title), (None, None))[1],
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
    percentile_map = get_job_title_percentile_map(db, country=country) if country else {}

    return [
        JobTitleInsight(
            job_title=row.job_title,
            headcount=row.headcount,
            avg_salary=float(row.avg_salary),
            p25_salary=percentile_map.get((country, row.job_title), (None, None))[0] if country else None,
            p75_salary=percentile_map.get((country, row.job_title), (None, None))[1] if country else None,
        )
        for row in rows
    ]


def get_salary_distribution(db: Session, country: str) -> SalaryDistribution | None:
    salaries = [
        float(row[0])
        for row in db.query(Employee.salary).filter(Employee.country == country).all()
    ]
    if not salaries:
        return None

    buckets = build_salary_buckets(salaries)
    return SalaryDistribution(
        country=country,
        buckets=[SalaryDistributionBucket(range_label=label, count=count) for label, count in buckets],
    )


def get_top_earners(db: Session, country: str | None = None, limit: int = 5) -> list[TopEarner]:
    query = db.query(Employee)
    if country:
        query = query.filter(Employee.country == country)

    rows = query.order_by(Employee.salary.desc(), Employee.full_name).limit(limit).all()
    return [
        TopEarner(
            full_name=row.full_name,
            job_title=row.job_title,
            salary=row.salary,
            currency=row.currency,
        )
        for row in rows
    ]


def get_department_summary(db: Session) -> list[DepartmentSummary]:
    rows = (
        db.query(
            Employee.department,
            func.count(Employee.id).label("headcount"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .group_by(Employee.department)
        .order_by(Employee.department)
        .all()
    )
    return [
        DepartmentSummary(
            department=row.department,
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


def resolve_salary_band(
    db: Session,
    *,
    country: str,
    job_title: str,
    salary: float,
) -> str:
    percentile_map = get_job_title_percentile_map(db)
    p25, p75 = percentile_map.get((country, job_title), (salary, salary))
    return classify_salary_band(salary, p25, p75).value
