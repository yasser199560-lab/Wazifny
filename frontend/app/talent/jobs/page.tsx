"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, MapPin, Search } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import { ApiError, applyToJob, companyImageUrl, saveJob, searchJobs, type Job } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const CATEGORY_OPTIONS = [
  "Engineering", "Design", "Marketing", "Finance", "Product", "Data & AI", "Sales", "Operations",
];

export default function BrowseJobsPage() {
  const token = useAuthStore((s) => s.token);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyState, setApplyState] = useState<Record<string, "idle" | "applying" | "applied">>({});
  const [savedState, setSavedState] = useState<Record<string, boolean>>({});

  async function runSearch() {
    setIsLoading(true);
    try {
      const res = await searchJobs({
        q: query || undefined,
        category: category || undefined,
        job_type: jobType || undefined,
      }, token);
      setJobs(res.jobs);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApply(jobId: string) {
    if (!token) return;
    setApplyState((prev) => ({ ...prev, [jobId]: "applying" }));
    try {
      await applyToJob(token, jobId);
      setApplyState((prev) => ({ ...prev, [jobId]: "applied" }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApplyState((prev) => ({ ...prev, [jobId]: "applied" }));
      } else {
        setApplyState((prev) => ({ ...prev, [jobId]: "idle" }));
      }
    }
  }

  async function handleSave(jobId: string) {
    if (!token) return;
    await saveJob(token, jobId);
    setSavedState((prev) => ({ ...prev, [jobId]: true }));
  }

  return (
    <TalentShell>
      <h1 className="text-2xl font-bold text-wazifny-navy">Browse Jobs</h1>
      <p className="mt-1 text-sm text-slate-500">Search all opportunities across Lebanon</p>

      <div className="mt-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Job title, company, or skills..."
            className="w-full border-0 bg-transparent text-sm text-wazifny-navy placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy"
        >
          <option value="">All Types</option>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="remote">Remote</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
        <button
          onClick={runSearch}
          className="rounded-lg bg-wazifny-green px-5 py-2 text-sm font-semibold text-white hover:bg-wazifny-green-dark"
        >
          Search
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-500">{jobs.length} jobs found</p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card sm:flex sm:items-stretch">
              <div className="flex h-32 shrink-0 items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 sm:h-auto sm:w-44">{job.company_logo_url ? <img src={companyImageUrl(job.company_logo_url) ?? ""} alt={`${job.company_name || "Company"} logo`} loading="lazy" className="h-20 w-20 rounded-xl bg-white object-contain p-2 shadow-sm" /> : <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-wazifny-navy text-2xl font-bold text-white shadow-sm">{(job.company_name || "W").slice(0, 1).toUpperCase()}</span>}</div>
              <div className="flex flex-1 flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h3 className="font-semibold text-wazifny-navy">{job.title}</h3>
                <p className="text-sm text-slate-400">{job.company_name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                    {job.job_type.replace("_", "-")}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                    {job.category}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {job.salary && (
                  <span className="mr-2 hidden text-sm font-semibold text-wazifny-green sm:inline">
                    {job.salary}
                  </span>
                )}
                {job.application_method === "external" ? (
                  <a
                    href={job.external_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-wazifny-orange px-4 py-2 text-sm font-semibold text-white hover:bg-wazifny-orange-dark"
                  >
                    Apply on Site <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={job.has_applied || (applyState[job.id] && applyState[job.id] !== "idle")}
                    className="rounded-lg bg-wazifny-green px-4 py-2 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:opacity-60"
                  >
                    {job.has_applied || applyState[job.id] === "applied" ? "Applied ✓" : "Apply Now"}
                  </button>
                )}
                <button
                  onClick={() => handleSave(job.id)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy hover:bg-slate-50"
                >
                  {savedState[job.id] ? "✓" : "Save"}
                </button>
              </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              No jobs match your search.
            </div>
          )}
        </div>
      )}
    </TalentShell>
  );
}
