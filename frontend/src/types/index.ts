export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT";
export type SalaryBand = "below_band" | "within_band" | "above_band";

export interface Employee {
  id: string;
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  employment_type: EmploymentType;
  created_at: string;
  updated_at: string;
  salary_band?: SalaryBand;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmployeeInput {
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  employment_type: EmploymentType;
}

export interface JobTitleInsight {
  job_title: string;
  avg_salary: number;
  headcount: number;
  p25_salary?: number | null;
  p75_salary?: number | null;
}

export interface CountryInsights {
  country: string;
  headcount: number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  top_job_titles: JobTitleInsight[];
}

export interface CountryBreakdown {
  country: string;
  headcount: number;
  avg_salary: number;
}

export interface OrgSummary {
  total_headcount: number;
  avg_salary: number;
  country_count: number;
  country_breakdown: CountryBreakdown[];
}

export interface EmployeeQueryParams {
  page?: number;
  page_size?: number;
  country?: string;
  job_title?: string;
  search?: string;
}

export interface SalaryDistributionBucket {
  range_label: string;
  count: number;
}

export interface SalaryDistribution {
  country: string;
  buckets: SalaryDistributionBucket[];
}

export interface TopEarner {
  full_name: string;
  job_title: string;
  salary: number;
  currency: string;
}

export interface DepartmentSummary {
  department: string;
  headcount: number;
  avg_salary: number;
}
