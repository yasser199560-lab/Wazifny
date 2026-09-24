"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Loader2, Pencil, Users } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { getMyJob, type Job } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function EmployerJobDetailsPage({ params }: { params: { id: string } }) {
  const token = useAuthStore((state) => state.token);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getMyJob(token, params.id)
      .then(setJob)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load this job."));
  }, [token, params.id]);

  if (!job && !error) {
    return <EmployerShell><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-wazifny-green" /></div></EmployerShell>;
  }

  if (error || !job) {
    return <EmployerShell><div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error || "Job not found."}</div></EmployerShell>;
  }

  return (
    <EmployerShell>
      <Link href="/employer/manage-jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-wazifny-navy"><ArrowLeft className="h-4 w-4" /> Back to Manage Jobs</Link>
      <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-wazifny-green/10 text-wazifny-green"><Briefcase className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-bold text-wazifny-navy">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{job.category} · {job.location} · {job.job_type.replaceAll("_", " ")}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold capitalize text-slate-600">{job.status.replaceAll("_", " ")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{job.applicants_count ?? 0} applicants</span>
              {job.salary && <span className="rounded-full bg-wazifny-green/10 px-3 py-1 font-semibold text-wazifny-green">{job.salary}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/employer/post-job?edit=${job.id}`} className="inline-flex items-center gap-2 rounded-lg bg-wazifny-green px-4 py-2.5 text-sm font-semibold text-white"><Pencil className="h-4 w-4" /> Edit job</Link>
          <Link href={`/employer/applicants?job=${job.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-wazifny-navy"><Users className="h-4 w-4" /> Applicants</Link>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-wazifny-navy">Job description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{job.description || "No description added."}</p>
        <h2 className="mt-7 font-semibold text-wazifny-navy">Requirements</h2>
        {job.requirements.length ? <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">{job.requirements.map((requirement, index) => <li key={`${index}-${requirement}`}>{requirement}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No requirements added.</p>}
        <h2 className="mt-7 font-semibold text-wazifny-navy">Application method</h2>
        <p className="mt-2 text-sm text-slate-600">{job.application_method === "external" ? "External application" : "Apply through Wazifny"}</p>
        {job.external_url && <a href={job.external_url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-sm text-wazifny-green underline">{job.external_url}</a>}
      </section>
    </EmployerShell>
  );
}
