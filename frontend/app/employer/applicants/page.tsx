"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, FileText, Loader2, Mail, Phone, Sparkles, Users, X } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import {
  aiScreenApplication,
  getApplicantCv,
  getApplicantsForJob,
  getMyJobs,
  saveCandidate,
  startApplicantConversation,
  updateApplicationStatus,
  type AiScreeningResult,
  type Applicant,
  type Job,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

const RECOMMENDATION_META: Record<string, { label: string; className: string }> = {
  shortlist: { label: "AI suggests: Shortlist", className: "bg-wazifny-green/10 text-wazifny-green" },
  consider: { label: "AI suggests: Consider", className: "bg-wazifny-orange/10 text-wazifny-orange" },
  reject: { label: "AI suggests: Reject", className: "bg-red-50 text-red-500" },
};

function ApplicantsContent() {
  const token = useAuthStore((s) => s.token);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(searchParams.get("job") || "");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [screening, setScreening] = useState<Record<string, boolean>>({});
  const [screenResults, setScreenResults] = useState<Record<string, AiScreeningResult>>({});
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [cvOpening, setCvOpening] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMyJobs(token).then((js) => {
      setJobs(js);
      if (!selectedJobId && js.length > 0) setSelectedJobId(js[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedJobId) return;
    setIsLoading(true);
    setScreenResults({});
    getApplicantsForJob(token, selectedJobId)
      .then(setApplicants)
      .finally(() => setIsLoading(false));
  }, [token, selectedJobId]);

  async function handleStatusChange(applicationId: string, status: string) {
    if (!token) return;
    await updateApplicationStatus(token, applicationId, status);
    setApplicants((prev) =>
      prev.map((a) => (a.application_id === applicationId ? { ...a, status } : a))
    );
  }

  async function handleSave(talentId: string) {
    if (!token) return;
    await saveCandidate(token, talentId);
    setSavedIds((prev) => new Set(prev).add(talentId));
  }

  async function handleAiScreen(applicationId: string) {
    if (!token) return;
    setScreening((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const result = await aiScreenApplication(token, applicationId);
      setScreenResults((prev) => ({ ...prev, [applicationId]: result }));
    } finally {
      setScreening((prev) => ({ ...prev, [applicationId]: false }));
    }
  }

  async function handleOpenCv(applicationId: string) {
    if (!token) return;
    setCvOpening(true);
    setCvError(null);
    // Open the tab synchronously so browser popup protections do not block a
    // legitimate employer action while the authenticated download loads.
    const viewer = window.open("", "_blank");
    try {
      const { blob } = await getApplicantCv(token, applicationId);
      const url = URL.createObjectURL(blob);
      if (viewer) {
        viewer.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      viewer?.close();
      setCvError(error instanceof Error ? error.message : "Could not open this CV.");
    } finally {
      setCvOpening(false);
    }
  }

  async function handleMessageApplicant(applicationId: string) {
    if (!token) return;
    setStartingConversation(true);
    try {
      const conversation = await startApplicantConversation(token, applicationId);
      router.push(`/employer/messages?conversation=${conversation.id}`);
    } finally {
      setStartingConversation(false);
    }
  }

  return (
    <EmployerShell>
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-wazifny-green" />
        <h1 className="text-2xl font-bold text-wazifny-navy">Applicants</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Review and manage candidates for your jobs</p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-slate-500">Viewing applicants for:</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <span className="rounded-full bg-wazifny-orange/10 px-3 py-1 text-xs font-semibold text-wazifny-orange">
          {applicants.length} applicants
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applicants.map((a) => {
            const screen = screenResults[a.application_id];
            const meta = screen?.recommendation ? RECOMMENDATION_META[screen.recommendation] : null;
            return (
              <div key={a.application_id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wazifny-green text-sm font-bold text-white">
                      {a.full_name[0]?.toUpperCase()}
                    </span>
                    <div>
                      <h3 className="font-semibold text-wazifny-navy">{a.full_name}</h3>
                      <p className="text-sm text-slate-400">{a.headline}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {a.city}{a.city && a.country ? ", " : ""}{a.country}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a.skills.slice(0, 6).map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>
                      {(a.education.length > 0 || a.experience.length > 0) && (
                        <div className="mt-2 space-y-0.5 text-xs text-slate-400">
                          {a.experience.slice(0, 1).map((e, i) => (
                            <p key={i}>{e.job_title} at {e.company_name}</p>
                          ))}
                          {a.education.slice(0, 1).map((e, i) => (
                            <p key={i}>{e.degree}, {e.institution}</p>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        {a.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {a.email}
                          </span>
                        )}
                        {a.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {a.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {a.match_score != null && (
                    <span className="rounded-lg bg-wazifny-green px-3 py-1 text-sm font-bold text-white">
                      {a.match_score}%
                    </span>
                  )}
                </div>

                {screen && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    {screen.ai_available ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta?.className}`}>
                            {meta?.label}
                          </span>
                          {screen.recommendation && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  a.application_id,
                                  screen.recommendation === "shortlist" ? "shortlisted" : screen.recommendation === "reject" ? "rejected" : "reviewed"
                                )
                              }
                              className="text-xs font-medium text-wazifny-green hover:underline"
                            >
                              Apply this status
                            </button>
                          )}
                        </div>
                        {screen.reasoning && <p className="mt-2 text-sm text-slate-600">{screen.reasoning}</p>}
                        {screen.strengths.length > 0 && (
                          <p className="mt-2 text-xs text-slate-500">
                            <span className="font-medium text-wazifny-green">Strengths:</span> {screen.strengths.join(", ")}
                          </p>
                        )}
                        {screen.gaps.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            <span className="font-medium text-wazifny-orange">Gaps:</span> {screen.gaps.join(", ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">AI screening isn&apos;t available right now — try again shortly.</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.application_id, e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize text-wazifny-navy"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => handleAiScreen(a.application_id)}
                    disabled={screening[a.application_id]}
                    className="flex items-center gap-1.5 rounded-lg border border-wazifny-green/30 bg-wazifny-green/5 px-3 py-2 text-sm font-medium text-wazifny-green hover:bg-wazifny-green/10 disabled:opacity-60"
                  >
                    {screening[a.application_id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Screen
                  </button>
                  <button
                    onClick={() => { setSelectedApplicant(a); setCvError(null); }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy hover:bg-slate-50"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleSave(a.talent_id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy hover:bg-slate-50"
                  >
                    <Bookmark className="h-4 w-4" /> {savedIds.has(a.talent_id) ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
          {applicants.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              No applicants for this job yet.
            </div>
          )}
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wazifny-navy/45 p-4" role="dialog" aria-modal="true" aria-label="Applicant profile">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-wazifny-green text-lg font-bold text-white">
                  {selectedApplicant.full_name[0]?.toUpperCase()}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-wazifny-navy">{selectedApplicant.full_name}</h2>
                  <p className="text-sm text-slate-500">{selectedApplicant.headline || "Candidate"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="text-slate-400 hover:text-wazifny-navy" aria-label="Close profile">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <section>
                <h3 className="font-semibold text-wazifny-navy">Contact & location</h3>
                <p className="mt-2 text-sm text-slate-600">{selectedApplicant.email || "Email not provided"}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedApplicant.phone || "Phone not provided"}</p>
                <p className="mt-1 text-sm text-slate-600">{[selectedApplicant.city, selectedApplicant.country].filter(Boolean).join(", ") || "Location not provided"}</p>
              </section>
              <section>
                <h3 className="font-semibold text-wazifny-navy">CV / Resume</h3>
                {selectedApplicant.cv_available ? (
                  <button
                    onClick={() => handleOpenCv(selectedApplicant.application_id)}
                    disabled={cvOpening}
                    className="mt-2 flex items-center gap-2 rounded-lg border border-wazifny-green/30 bg-wazifny-green/5 px-3 py-2 text-sm font-medium text-wazifny-green hover:bg-wazifny-green/10 disabled:opacity-60"
                  >
                    {cvOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {cvOpening ? "Opening CV..." : `View ${selectedApplicant.cv_filename || "CV"}`}
                  </button>
                ) : <p className="mt-2 text-sm text-slate-400">No CV uploaded.</p>}
                {cvError && <p className="mt-2 text-xs text-red-600">{cvError}</p>}
              </section>
            </div>

            <section className="mt-5">
              <h3 className="font-semibold text-wazifny-navy">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedApplicant.skills.length ? selectedApplicant.skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{skill}</span>) : <p className="text-sm text-slate-400">No skills listed.</p>}
              </div>
            </section>
            <section className="mt-5">
              <h3 className="font-semibold text-wazifny-navy">Experience</h3>
              {selectedApplicant.experience.length ? <div className="mt-2 space-y-2">{selectedApplicant.experience.map((item, index) => <p key={index} className="text-sm text-slate-600"><span className="font-medium">{item.job_title}</span> at {item.company_name}</p>)}</div> : <p className="mt-2 text-sm text-slate-400">No experience listed.</p>}
            </section>
            <section className="mt-5">
              <h3 className="font-semibold text-wazifny-navy">Education</h3>
              {selectedApplicant.education.length ? <div className="mt-2 space-y-2">{selectedApplicant.education.map((item, index) => <p key={index} className="text-sm text-slate-600"><span className="font-medium">{item.degree}</span>, {item.institution}</p>)}</div> : <p className="mt-2 text-sm text-slate-400">No education listed.</p>}
            </section>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <button onClick={() => handleMessageApplicant(selectedApplicant.application_id)} disabled={startingConversation} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-wazifny-navy hover:bg-slate-50 disabled:opacity-60">
                {startingConversation ? "Opening chat..." : "Message candidate"}
              </button>
              <button onClick={() => handleAiScreen(selectedApplicant.application_id)} disabled={screening[selectedApplicant.application_id]} className="flex items-center gap-1.5 rounded-lg bg-wazifny-green px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
                {screening[selectedApplicant.application_id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI Screen
              </button>
              <button onClick={() => setSelectedApplicant(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-wazifny-navy">Close</button>
            </div>
          </div>
        </div>
      )}
    </EmployerShell>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicantsContent />
    </Suspense>
  );
}
