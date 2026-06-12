import type {
  CountryInsights,
  JobTitleInsight,
  OrgSummary,
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobTitleInsights.map((item) => (
                <TableRow key={item.job_title}>
                  <TableCell>{item.job_title}</TableCell>
                  <TableCell>{item.headcount}</TableCell>
                  <TableCell>{formatNumber(item.avg_salary, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
