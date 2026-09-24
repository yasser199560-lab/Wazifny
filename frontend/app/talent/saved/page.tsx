"use client";

import { useEffect, useState } from "react";
import { Briefcase, Loader2, MapPin, X } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import { ApiError, applyToJob, getSavedJobs, unsaveJob, type Job } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SavedJobsPage() {
  const token = useAuthStore((s) => s.token);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyState, setApplyState] = useState<Record<string, "idle" | "applying" | "applied">>({});

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      setJobs(await getSavedJobs(token));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleRemove(jobId: string) {
    if (!token) return;
    await unsaveJob(token, jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

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

  return (
    <TalentShell>
      <h1 className="text-2xl font-bold text-wazifny-navy">Saved Jobs</h1>
      <p className="mt-1 text-sm text-slate-500">{jobs.length} jobs saved</p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          You haven&apos;t saved any jobs yet — bookmark one from Browse Jobs or AI Matches.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-card sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-wazifny-navy">{job.title}</h3>
                  <p className="text-sm text-slate-400">{job.company_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                      {job.job_type.replace("_", "-")}
                    </span>
                    {job.match_score != null && (
                      <span className="rounded-full bg-wazifny-green/10 px-2.5 py-1 font-semibold text-wazifny-green">
                        {job.match_score}% match
                      </span>
                    )}
                  </div>
                  {job.salary && (
                    <p className="mt-1 text-sm font-semibold text-wazifny-green">{job.salary}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={job.has_applied || (applyState[job.id] && applyState[job.id] !== "idle")}
                  className="rounded-lg bg-wazifny-green px-4 py-2 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:opacity-60"
                >
                  {job.has_applied || applyState[job.id] === "applied" ? "Applied ✓" : "Apply Now"}
                </button>
                <button
                  onClick={() => handleRemove(job.id)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-red-500"
                  aria-label="Remove from saved"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </TalentShell>
  );
}
