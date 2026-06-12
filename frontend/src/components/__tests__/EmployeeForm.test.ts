import { describe, expect, it } from "vitest";
import { employeeSchema } from "@/components/EmployeeForm";

describe("employeeSchema", () => {
  it("accepts valid employee data", () => {
    const result = employeeSchema.safeParse({
      full_name: "Jane Doe",
      job_title: "Software Engineer",
      department: "Engineering",
      country: "United States",
      currency: "USD",
      salary: 120000,
      employment_type: "FULL_TIME",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = employeeSchema.safeParse({
      full_name: "",
      job_title: "",
      department: "",
      country: "",
      currency: "US",
      salary: -1,
      employment_type: "FULL_TIME",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-positive salary", () => {
    const result = employeeSchema.safeParse({
      full_name: "Jane Doe",
      job_title: "Software Engineer",
      department: "Engineering",
      country: "United States",
      currency: "USD",
      salary: 0,
      employment_type: "FULL_TIME",
    });

    expect(result.success).toBe(false);
  });
});
