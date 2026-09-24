"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Eye, Loader2, XCircle } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import { getMyApplications, startConversation, type ApplicationOut } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const STATUS_META: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-slate-100 text-slate-500", icon: Clock },
  reviewed: { label: "Reviewed", className: "bg-wazifny-green/10 text-wazifny-green", icon: Eye },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-wazifny-green/10 text-wazifny-green",
    icon: CheckCircle2,
  },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-500", icon: XCircle },
  hired: { label: "Hired", className: "bg-wazifny-green/10 text-wazifny-green", icon: CheckCircle2 },
};

export default function ApplicationsPage() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState<string | null>(null);

  async function handleMessageEmployer(application: ApplicationOut) {
    if (!token || !application.employer_id) return;
    setStartingConversation(application.id);
    try {
      const conversation = await startConversation(token, application.employer_id);
      router.push(`/talent/messages?conversation=${conversation.id}`);
    } finally {
      setStartingConversation(null);
    }
  }

  useEffect(() => {
    if (!token) return;
    getMyApplications(token)
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, [token]);

  const counts = ["pending", "reviewed", "shortlisted", "rejected"].map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <TalentShell>
      <h1 className="text-2xl font-bold text-wazifny-navy">Application Tracker</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of all your job applications</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {counts.map(({ status, count }) => {
          const meta = STATUS_META[status];
          return (
            <div
              key={status}
              className="rounded-xl border border-slate-100 bg-white p-5 text-center shadow-card"
            >
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                {meta.label}
              </span>
              <p className="mt-3 text-2xl font-bold text-wazifny-navy">{count}</p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          You haven&apos;t applied to any jobs yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => {
            const meta = STATUS_META[app.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div
                key={app.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-card sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-wazifny-navy">{app.job_title}</h3>
                  <p className="text-sm text-slate-400">{app.company_name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                    >
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                    {app.match_score != null && (
                      <span className="rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
                        {app.match_score}% match
                      </span>
                    )}
                    {app.applied_at && (
                      <span className="text-xs text-slate-400">
                        Applied {new Date(app.applied_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {app.employer_id && (
                  <button
                    onClick={() => handleMessageEmployer(app)}
                    disabled={startingConversation === app.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-wazifny-navy hover:bg-slate-50 disabled:opacity-60"
                  >
                    {startingConversation === app.id ? "Opening chat..." : "Message employer"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </TalentShell>
  );
}
