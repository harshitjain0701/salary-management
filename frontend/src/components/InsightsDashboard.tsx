import type {
  CountryInsights,
  DepartmentSummary,
  JobTitleInsight,
  OrgSummary,
  SalaryDistribution,
  TopEarner,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InsightsDashboardProps {
  countryInsights: CountryInsights | null;
  jobTitleInsights: JobTitleInsight[];
  orgSummary: OrgSummary | null;
  salaryDistribution: SalaryDistribution | null;
  topEarners: TopEarner[];
  departmentSummary: DepartmentSummary[];
  loading?: boolean;
}

function formatNumber(value: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function inferCurrency(country: string): string {
  const map: Record<string, string> = {
    "United States": "USD",
    "United Kingdom": "GBP",
    India: "INR",
    Germany: "EUR",
    Canada: "CAD",
    Australia: "AUD",
    France: "EUR",
    Japan: "JPY",
    Brazil: "BRL",
    Singapore: "SGD",
    Netherlands: "EUR",
    Spain: "EUR",
    Mexico: "MXN",
    "South Africa": "ZAR",
    "United Arab Emirates": "AED",
  };
  return map[country] ?? "USD";
}

export default function InsightsDashboard({
  countryInsights,
  jobTitleInsights,
  orgSummary,
  salaryDistribution,
  topEarners,
  departmentSummary,
  loading,
}: InsightsDashboardProps) {
  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading insights...</div>;
  }

  const currency = countryInsights ? inferCurrency(countryInsights.country) : "USD";
  const maxBucketCount = Math.max(...(salaryDistribution?.buckets.map((b) => b.count) ?? [1]), 1);

  return (
    <div className="space-y-8">
      {orgSummary && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Organization Summary</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Headcount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orgSummary.total_headcount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{orgSummary.country_count}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {countryInsights && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">{countryInsights.country} Insights</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Min Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(countryInsights.min_salary, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Max Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(countryInsights.max_salary, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(countryInsights.avg_salary, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Headcount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{countryInsights.headcount}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {salaryDistribution && salaryDistribution.buckets.some((b) => b.count > 0) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Salary Distribution</h3>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {salaryDistribution.buckets.map((bucket) => (
                <div key={bucket.range_label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{bucket.range_label}</span>
                    <span className="text-muted-foreground">{bucket.count} employees</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(bucket.count / maxBucketCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {topEarners.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Top Earners</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEarners.map((earner) => (
                <TableRow key={`${earner.full_name}-${earner.salary}`}>
                  <TableCell className="font-medium">{earner.full_name}</TableCell>
                  <TableCell>{earner.job_title}</TableCell>
                  <TableCell>{formatNumber(earner.salary, earner.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {departmentSummary.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Department Summary</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead>Avg Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentSummary.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell>{dept.department}</TableCell>
                  <TableCell>{dept.headcount}</TableCell>
                  <TableCell>{formatNumber(dept.avg_salary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Average Salary by Job Title</h3>
        {jobTitleInsights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No job title data available.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead>Average Salary</TableHead>
                <TableHead>P25</TableHead>
                <TableHead>P75</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobTitleInsights.map((item) => (
                <TableRow key={item.job_title}>
                  <TableCell>{item.job_title}</TableCell>
                  <TableCell>{item.headcount}</TableCell>
                  <TableCell>{formatNumber(item.avg_salary, currency)}</TableCell>
                  <TableCell>
                    {item.p25_salary != null ? formatNumber(item.p25_salary, currency) : "—"}
                  </TableCell>
                  <TableCell>
                    {item.p75_salary != null ? formatNumber(item.p75_salary, currency) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
