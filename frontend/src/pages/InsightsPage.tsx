import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/api/client";
import InsightsDashboard from "@/components/InsightsDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CountryInsights,
  JobTitleInsight,
  OrgSummary,
} from "@/types";

export default function InsightsPage() {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryInsights, setCountryInsights] = useState<CountryInsights | null>(null);
  const [jobTitleInsights, setJobTitleInsights] = useState<JobTitleInsight[]>([]);
  const [orgSummary, setOrgSummary] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = useCallback(async () => {
    try {
      const list = await api.getCountries();
      setCountries(list);
      if (list.length > 0) {
        setSelectedCountry((current) => current || list[0]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load countries");
    }
  }, []);

  const loadInsights = useCallback(async () => {
    if (!selectedCountry) return;
    setLoading(true);
    setError(null);
    try {
      const [countryData, titleData, summaryData] = await Promise.all([
        api.getCountryInsights(selectedCountry),
        api.getJobTitleInsights(selectedCountry),
        api.getOrgSummary(),
      ]);
      setCountryInsights(countryData);
      setJobTitleInsights(titleData);
      setOrgSummary(summaryData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Insights</h2>
          <p className="text-sm text-muted-foreground">Salary analytics by country and job title</p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <InsightsDashboard
        countryInsights={countryInsights}
        jobTitleInsights={jobTitleInsights}
        orgSummary={orgSummary}
        loading={loading}
      />
    </div>
  );
}
