import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import EmployeesPage from "./pages/EmployeesPage";
import InsightsPage from "./pages/InsightsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
            <h1 className="text-lg font-semibold">Salary Management</h1>
            <nav className="flex gap-4 text-sm">
              <Link to="/employees" className="text-muted-foreground hover:text-foreground">
                Employees
              </Link>
              <Link to="/insights" className="text-muted-foreground hover:text-foreground">
                Insights
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
