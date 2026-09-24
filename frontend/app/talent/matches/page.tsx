"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, MapPin, Sparkles } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import PreferencesPrompt from "@/components/jobs/PreferencesPrompt";
import {
  ApiError,
  applyToJob,
  getAiMatches,
  saveJob,
  updateTalentPreferences,
  type Job,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function scoreColor(score: number) {
  if (score >= 80) return "bg-wazifny-green";
  if (score >= 60) return "bg-wazifny-orange";
  return "bg-slate-400";
}

export default function AiMatchesPage() {
  const token = useAuthStore((s) => s.token);
  const [matches, setMatches] = useState<Job[]>([]);
  const [personalized, setPersonalized] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [applyState, setApplyState] = useState<Record<string, "idle" | "applying" | "applied">>({});
  const [savedState, setSavedState] = useState<Record<string, boolean>>({});

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await getAiMatches(token);
      setPersonalized(res.personalized);
      setMatches(res.matches);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-wazifny-orange" />
        <h1 className="text-2xl font-bold text-wazifny-navy">AI Job Matches</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        {matches.length} job{matches.length === 1 ? "" : "s"} matched to your profile
      </p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : !personalized ? (
        <PreferencesPrompt
          onSubmit={async (payload) => {
            if (!token) return;
            await updateTalentPreferences(token, payload);
            await load();
          }}
          onDismiss={() => {}}
        />
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-wazifny-green/10 px-4 py-3 text-sm text-wazifny-green">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              AI matching is active — scores are calculated from your skills,
              experience, and preferences. Update your profile anytime to
              improve your matches.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {matches.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-slate-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-wazifny-navy">{job.title}</h3>
                    <p className="text-sm text-slate-400">{job.company_name}</p>
                  </div>
                  {job.match_score != null && (
                    <div className="text-right">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 text-sm font-bold text-white ${scoreColor(job.match_score)}`}
                      >
                        {job.match_score}%
                      </span>
                      <p className="mt-0.5 text-xs text-slate-400">match</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                    {job.category}
                  </span>
                  {job.application_method === "external" && (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-500">
                      External
                    </span>
                  )}
                </div>

                {job.salary && (
                  <p className="mt-2 text-sm font-semibold text-wazifny-green">{job.salary}</p>
                )}
                {job.match_reason && (
                  <p className="mt-2 text-xs text-slate-500">{job.match_reason}</p>
                )}

                <div className="mt-4 flex gap-2">
                  {job.application_method === "external" ? (
                    <a
                      href={job.external_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-wazifny-orange px-4 py-2 text-sm font-semibold text-white hover:bg-wazifny-orange-dark"
                    >
                      Apply on Site <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={job.has_applied || (applyState[job.id] && applyState[job.id] !== "idle")}
                      className="flex-1 rounded-lg bg-wazifny-green px-4 py-2 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:opacity-60"
                    >
                      {job.has_applied || applyState[job.id] === "applied" ? "Applied ✓" : "Apply Now"}
                    </button>
                  )}
                  <button
                    onClick={() => handleSave(job.id)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy hover:bg-slate-50"
                  >
                    {savedState[job.id] ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </TalentShell>
  );
}
