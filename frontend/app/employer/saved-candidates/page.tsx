"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, X } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { getSavedCandidates, unsaveCandidate, type CandidateSummary } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SavedCandidatesPage() {
  const token = useAuthStore((s) => s.token);
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getSavedCandidates(token)
      .then(setCandidates)
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleRemove(talentId: string) {
    if (!token) return;
    await unsaveCandidate(token, talentId);
    setCandidates((prev) => prev.filter((c) => c.talent_id !== talentId));
  }

  return (
    <EmployerShell>
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-wazifny-orange" />
        <h1 className="text-2xl font-bold text-wazifny-navy">Saved Candidates</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">{candidates.length} candidates saved</p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {candidates.map((c) => (
            <div key={c.talent_id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wazifny-green text-sm font-bold text-white">
                    {c.full_name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-semibold text-wazifny-navy">{c.full_name}</h3>
                    <p className="text-sm text-slate-400">{c.headline}</p>
                    {c.city && <p className="text-xs text-slate-400">{c.city}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.match_score != null && (
                    <span className="rounded-lg bg-wazifny-green px-2.5 py-1 text-xs font-bold text-white">
                      {c.match_score}%
                    </span>
                  )}
                  <button onClick={() => handleRemove(c.talent_id)} className="text-slate-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.skills.slice(0, 5).map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                ))}
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="col-span-2 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              No saved candidates yet — bookmark them from the Applicants page.
            </div>
          )}
        </div>
      )}
    </EmployerShell>
  );
}
