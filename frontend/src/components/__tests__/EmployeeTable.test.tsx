import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmployeeTable from "@/components/EmployeeTable";
import type { Employee } from "@/types";

const sampleEmployee: Employee = {
  id: "1",
  full_name: "Jane Doe",
  job_title: "Software Engineer",
  department: "Engineering",
  country: "United States",
  currency: "USD",
  salary: 120000,
  employment_type: "FULL_TIME",
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
  salary_band: "within_band",
};

describe("EmployeeTable", () => {
  it("renders employee rows", () => {
    render(<EmployeeTable employees={[sampleEmployee]} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Within band")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<EmployeeTable employees={[]} loading />);

    expect(screen.getByText("Loading employees...")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<EmployeeTable employees={[]} />);

    expect(screen.getByText("No employees found.")).toBeInTheDocument();
  });
});
