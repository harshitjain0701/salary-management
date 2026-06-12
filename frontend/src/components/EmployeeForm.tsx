import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, EmploymentType } from "@/types";

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
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

const DEPARTMENTS = ["Engineering", "Product", "Data", "HR", "Finance"];
const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT"];

const employeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  job_title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  salary: z.coerce.number().positive("Salary must be a positive number"),
  employment_type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  countries: string[];
  jobTitles: string[];
  onSuccess: () => void;
}

const defaultValues: EmployeeFormValues = {
  full_name: "",
  job_title: "",
  department: "Engineering",
  country: "United States",
  currency: "USD",
  salary: 0,
  employment_type: "FULL_TIME",
};

export default function EmployeeForm({
  open,
  onOpenChange,
  employee,
  countries,
  jobTitles,
  onSuccess,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const selectedCountry = watch("country");

  useEffect(() => {
    if (employee) {
      reset({
        full_name: employee.full_name,
        job_title: employee.job_title,
        department: employee.department,
        country: employee.country,
        currency: employee.currency,
        salary: employee.salary,
        employment_type: employee.employment_type,
      });
    } else {
      reset(defaultValues);
    }
  }, [employee, open, reset]);

  useEffect(() => {
    if (selectedCountry && COUNTRY_CURRENCY_MAP[selectedCountry]) {
      setValue("currency", COUNTRY_CURRENCY_MAP[selectedCountry]);
    }
  }, [selectedCountry, setValue]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (employee) {
        await api.updateEmployee(employee.id, values);
      } else {
        await api.createEmployee(values);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save employee";
      alert(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Select value={watch("job_title")} onValueChange={(value) => setValue("job_title", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.job_title && <p className="text-sm text-destructive">{errors.job_title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={watch("department")} onValueChange={(value) => setValue("department", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={watch("country")} onValueChange={(value) => setValue("country", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" maxLength={3} {...register("currency")} />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" type="number" step="0.01" {...register("salary")} />
              {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={watch("employment_type")}
                onValueChange={(value) => setValue("employment_type", value as EmploymentType, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employment_type && <p className="text-sm text-destructive">{errors.employment_type.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : employee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { employeeSchema, COUNTRY_CURRENCY_MAP };
