import enum
from statistics import quantiles


class SalaryBand(str, enum.Enum):
    BELOW_BAND = "below_band"
    WITHIN_BAND = "within_band"
    ABOVE_BAND = "above_band"


SALARY_BUCKET_EDGES = [0, 50_000, 100_000, 150_000, 200_000, float("inf")]


def compute_percentiles(salaries: list[float]) -> tuple[float, float]:
    if not salaries:
        return 0.0, 0.0
    if len(salaries) == 1:
        value = salaries[0]
        return value, value
    p25, _, p75 = quantiles(salaries, n=4, method="inclusive")
    return float(p25), float(p75)


def classify_salary_band(salary: float, p25: float, p75: float) -> SalaryBand:
    if salary < p25:
        return SalaryBand.BELOW_BAND
    if salary > p75:
        return SalaryBand.ABOVE_BAND
    return SalaryBand.WITHIN_BAND


def build_salary_buckets(salaries: list[float]) -> list[tuple[str, int]]:
    labels = [
        "0-50k",
        "50k-100k",
        "100k-150k",
        "150k-200k",
        "200k+",
    ]
    counts = [0] * len(labels)

    for salary in salaries:
        for index, upper_bound in enumerate(SALARY_BUCKET_EDGES[1:]):
            lower_bound = SALARY_BUCKET_EDGES[index]
            if lower_bound <= salary < upper_bound:
                counts[index] += 1
                break

    return list(zip(labels, counts))
