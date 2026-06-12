import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/api/client";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeTable from "@/components/EmployeeTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/types";

const PAGE_SIZE = 25;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [country, setCountry] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, country, jobTitle]);

  const loadFilters = useCallback(async () => {
    try {
      const [countryList, titleList] = await Promise.all([api.getCountries(), api.getJobTitles()]);
      setCountries(countryList);
      setJobTitles(titleList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load filters");
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getEmployees({
        page,
        page_size: PAGE_SIZE,
        country: country || undefined,
        job_title: jobTitle || undefined,
        search: debouncedSearch || undefined,
      });
      setEmployees(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [page, country, jobTitle, debouncedSearch]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      await api.deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">Manage employee salary records</p>
        </div>
        <div className="flex flex-wrap gap-2">
<Button
            onClick={() => {
              setEmployeeToEdit(null);
              setFormOpen(true);
            }}
          >
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={country || "all"} onValueChange={(value) => setCountry(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={jobTitle || "all"} onValueChange={(value) => setJobTitle(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by job title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All job titles</SelectItem>
            {jobTitles.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <EmployeeTable
        employees={employees}
        loading={loading}
        onEdit={(employee) => {
          setEmployeeToEdit(employee);
          setFormOpen(true);
        }}
        onDelete={(employee) => setEmployeeToDelete(employee)}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {employees.length} of {total} employees
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employeeToEdit}
        countries={countries}
        jobTitles={jobTitles}
        onSuccess={loadEmployees}
      />

      <Dialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employeeToDelete?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
