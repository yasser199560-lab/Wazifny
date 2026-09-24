"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, Plus, TrendingUp, Users, Star } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { getEmployerDashboard, type EmployerDashboard } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function EmployerDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const fullName = useAuthStore((s) => s.fullName);
  const [data, setData] = useState<EmployerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getEmployerDashboard(token)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [token]);

  const stats = data
    ? [
        { label: "Active Jobs", value: data.active_jobs, icon: Briefcase, color: "bg-wazifny-green/10 text-wazifny-green" },
        { label: "Total Applicants", value: data.total_applicants, icon: Users, color: "bg-wazifny-orange/10 text-wazifny-orange" },
        { label: "Shortlisted", value: data.shortlisted, icon: TrendingUp, color: "bg-wazifny-green/10 text-wazifny-green" },
        { label: "Saved Candidates", value: data.saved_candidates, icon: Star, color: "bg-blue-100 text-blue-600" },
      ]
    : [];

  return (
    <EmployerShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wazifny-navy">Employer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {fullName}</p>
        </div>
        <Link
          href="/employer/post-job"
          className="flex items-center gap-2 rounded-lg bg-wazifny-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-wazifny-green-dark"
        >
          <Plus className="h-4 w-4" /> Post a Job
        </Link>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-2xl font-bold text-wazifny-navy">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-wazifny-navy">Recent Job Postings</h2>
                <Link href="/employer/manage-jobs" className="text-sm text-wazifny-green hover:underline">
                  View all →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {data.recent_jobs.map((j) => (
                  <div key={j.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-wazifny-navy">{j.title}</p>
                      <p className="text-xs text-slate-400">{j.applicants_count} applicants</p>
                    </div>
                    <span className="rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
                      {j.status}
                    </span>
                  </div>
                ))}
                {data.recent_jobs.length === 0 && (
                  <p className="text-sm text-slate-400">No jobs posted yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-wazifny-navy">Top Matched Candidates</h2>
                <Link href="/employer/applicants" className="text-sm text-wazifny-green hover:underline">
                  View all →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {data.top_candidates.map((c) => (
                  <div key={c.talent_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wazifny-green text-xs font-bold text-white">
                        {c.full_name[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-wazifny-navy">{c.full_name}</p>
                        <p className="text-xs text-slate-400">{c.headline}</p>
                      </div>
                    </div>
                    {c.match_score != null && (
                      <span className="rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
                        {c.match_score}%
                      </span>
                    )}
                  </div>
                ))}
                {data.top_candidates.length === 0 && (
                  <p className="text-sm text-slate-400">No applicants yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </EmployerShell>
  );
}
