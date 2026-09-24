"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, Plus, Users, X } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { closeJob, getMyJobs, type Job } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function ManageJobsPage() {
  const token = useAuthStore((s) => s.token);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      setJobs(await getMyJobs(token));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleClose(jobId: string) {
    if (!token) return;
    if (!confirm("Close this job posting? It will stop accepting new applications.")) return;
    await closeJob(token, jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "closed" } : j)));
  }

  const activeCount = jobs.filter((j) => j.status === "active").length;

  return (
    <EmployerShell>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-wazifny-green" />
            <h1 className="text-2xl font-bold text-wazifny-navy">Manage Jobs</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">{activeCount} active postings</p>
        </div>
        <Link
          href="/employer/post-job"
          className="flex items-center gap-2 rounded-lg bg-wazifny-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-wazifny-green-dark"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
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
                  <p className="text-sm text-slate-400">
                    {job.location} · {job.job_type.replace("_", "-")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {job.applicants_count ?? 0} applicants
                    {job.salary && <> · <span className="text-wazifny-green font-medium">{job.salary}</span></>}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    job.status === "active" ? "bg-wazifny-green/10 text-wazifny-green" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {job.status === "active" ? "Active" : "Closed"}
                </span>
                <Link
                  href={`/employer/applicants?job=${job.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy hover:bg-slate-50"
                >
                  <Users className="h-4 w-4" /> Applicants
                </Link>
                {job.status === "active" && (
                  <button
                    onClick={() => handleClose(job.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                    aria-label="Close job"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              You haven&apos;t posted any jobs yet.
            </div>
          )}
        </div>
      )}
    </EmployerShell>
  );
}
