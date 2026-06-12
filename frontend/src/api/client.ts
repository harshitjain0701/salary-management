import type {
  CountryInsights,
  DepartmentSummary,
  Employee,
  EmployeeInput,
  EmployeeListResponse,
  EmployeeQueryParams,
  JobTitleInsight,
  OrgSummary,
  SalaryDistribution,
  TopEarner,
} from "@/types";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const api = {
  getEmployees(params: EmployeeQueryParams = {}): Promise<EmployeeListResponse> {
    return request(`/api/employees${buildQuery(params)}`);
  },

  getEmployee(id: string): Promise<Employee> {
    return request(`/api/employees/${id}`);
  },

  createEmployee(payload: EmployeeInput): Promise<Employee> {
    return request("/api/employees", { method: "POST", body: JSON.stringify(payload) });
  },

  updateEmployee(id: string, payload: Partial<EmployeeInput>): Promise<Employee> {
    return request(`/api/employees/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },

  deleteEmployee(id: string): Promise<void> {
    return request(`/api/employees/${id}`, { method: "DELETE" });
  },

  getCountries(): Promise<string[]> {
    return request("/api/countries");
  },

  getJobTitles(): Promise<string[]> {
    return request("/api/job-titles");
  },

  getCountryInsights(country: string): Promise<CountryInsights> {
    return request(`/api/insights/country/${encodeURIComponent(country)}`);
  },

  getJobTitleInsights(country?: string): Promise<JobTitleInsight[]> {
    return request(`/api/insights/job-title${buildQuery({ country })}`);
  },

  getOrgSummary(): Promise<OrgSummary> {
    return request("/api/insights/summary");
  },

  getSalaryDistribution(country: string): Promise<SalaryDistribution> {
    return request(`/api/insights/salary-distribution/${encodeURIComponent(country)}`);
  },

  getTopEarners(country?: string, limit = 5): Promise<TopEarner[]> {
    return request(`/api/insights/top-earners${buildQuery({ country, limit })}`);
  },

  getDepartmentSummary(): Promise<DepartmentSummary[]> {
    return request("/api/insights/department-summary");
  },

  exportEmployeesCsv(params: EmployeeQueryParams = {}): void {
    const url = `${API_BASE_URL}/api/employees/export/csv${buildQuery(params)}`;
    window.open(url, "_blank");
  },
};

export { ApiError };
