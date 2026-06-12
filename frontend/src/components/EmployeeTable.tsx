import { Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

function formatSalary(salary: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(salary);
}

export default function EmployeeTable({ employees, loading, onEdit, onDelete }: EmployeeTableProps) {
  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No employees found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.full_name}</TableCell>
            <TableCell>{employee.job_title}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.country}</TableCell>
            <TableCell>{formatSalary(employee.salary, employee.currency)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} aria-label="Edit employee">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(employee)} aria-label="Delete employee">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
