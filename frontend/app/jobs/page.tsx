"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import JobCard from "@/components/jobs/JobCard";
import PreferencesPrompt from "@/components/jobs/PreferencesPrompt";
import {
  ApiError,
  applyToJob,
  getRecommendedJobs,
  searchJobs,
  updateTalentPreferences,
  type Job,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const CATEGORY_OPTIONS = [
  "Engineering",
  "Design",
  "Marketing",
  "Finance",
  "Product",
  "Data & AI",
  "Sales",
  "Operations",
];

const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "remote", label: "Remote" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

type ApplyState = "idle" | "applying" | "applied";

function FindJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, role, hydrate, isHydrated } = useAuthStore();
  const { t } = useLanguage();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [jobType, setJobType] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [aiRanked, setAiRanked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyStates, setApplyStates] = useState<Record<string, ApplyState>>({});
  const [justApplied, setJustApplied] = useState(false);

  const isTalent = role === "talent";

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isFiltering = Boolean(query || location || category || jobType);

      if (isTalent && token && !isFiltering) {
        // Default talent view: AI-personalized recommendations.
        const res = await getRecommendedJobs(token);
        setPersonalized(res.personalized);
        setAiRanked(res.ai_ranked);
        setRecommended(res.recommended);
        setJobs(res.other);
        setShowPreferencesPrompt(!res.personalized && !dismissedPrompt);
        setExpandedId(res.recommended[0]?.id ?? res.other[0]?.id ?? null);
      } else {
        const res = await searchJobs({
          q: query || undefined,
          location: location || undefined,
          category: category || undefined,
          job_type: jobType || undefined,
        }, token);
        setAiRanked(res.ai_ranked);
        setRecommended([]);
        setJobs(res.jobs);
        setShowPreferencesPrompt(false);
        setExpandedId(res.jobs[0]?.id ?? null);
      }
    } catch {
      setError(t("Couldn't load jobs right now. Please try again in a moment."));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location, category, jobType, isTalent, token, dismissedPrompt]);

  useEffect(() => {
    if (!isHydrated) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // Land here right after register() already submitted the application for
  // us (see the register page) — just reflect that in the UI.
  useEffect(() => {
    const appliedJobId = searchParams.get("apply");
    if (appliedJobId && token && role === "talent") {
      setApplyStates((prev) => ({ ...prev, [appliedJobId]: "applied" }));
      setExpandedId(appliedJobId);
      setJustApplied(true);
      router.replace("/jobs");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch();
  }

  function clearFilters() {
    setQuery("");
    setLocation("");
    setCategory("");
    setJobType("");
    setTimeout(runSearch, 0);
  }

  async function handleApply(jobId: string) {
    if (!token || role !== "talent") {
      router.push(`/register?role=talent&next=${jobId}`);
      return;
    }
    setApplyStates((prev) => ({ ...prev, [jobId]: "applying" }));
    try {
      await applyToJob(token, jobId);
      setApplyStates((prev) => ({ ...prev, [jobId]: "applied" }));
      setJustApplied(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already applied — treat as success from the UI's perspective.
        setApplyStates((prev) => ({ ...prev, [jobId]: "applied" }));
      } else {
        setApplyStates((prev) => ({ ...prev, [jobId]: "idle" }));
        setError(t("Couldn't submit your application. Please try again."));
      }
    }
  }

  async function handleSavePreferences(payload: {
    skills: string[];
    preferred_categories: string[];
  }) {
    if (!token) return;
    await updateTalentPreferences(token, payload);
    setShowPreferencesPrompt(false);
    await runSearch();
  }

  const totalCount = recommended.length + jobs.length;

  return (
    <main>
      <Navbar />

      <section className="relative overflow-hidden bg-wazifny-navy py-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-wazifny-navy/70" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t("Find Jobs")}</h1>
          <p className="mt-2 text-slate-300">
            {isTalent
              ? "AI-matched picks based on your profile, plus everything else on Wazifny."
              : "Search jobs across every field on Wazifny — sign in as a talent for AI-personalized matches."}
          </p>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-2 sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Job title, keywords, or company (AI-powered)")}
                className="w-full border-0 bg-transparent text-sm text-wazifny-navy placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </label>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <label className="flex items-center gap-2 px-3 py-2 sm:w-48">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("Location")}
                className="w-full border-0 bg-transparent text-sm text-wazifny-navy placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-wazifny-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark"
            >
              {t("Find Jobs")}
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 lg:grid-cols-[250px_1fr] lg:px-8">
          {/* Sidebar filters */}
          <aside className="h-fit rounded-lg bg-[#f3f6fc] p-5">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("Category")}
              </p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-wazifny-navy focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
              >
                <option value="">{t("All Categories")}</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("Type")}
              </p>
              <div className="space-y-1.5">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                  >
                    <input
                      type="radio"
                      name="job_type"
                      checked={jobType === opt.value}
                      onChange={() => setJobType(opt.value)}
                      className="h-4 w-4 border-slate-300 text-wazifny-green focus:ring-wazifny-green"
                    />
                    {t(opt.label)}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                runSearch();
              }}
              className="w-full rounded-lg bg-wazifny-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark"
            >
              {t("Apply Filters")}
            </button>
            {(query || location || category || jobType) && (
              <button
                onClick={clearFilters}
                className="mt-2 flex w-full items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" /> {t("Clear filters")}
              </button>
            )}
          </aside>

          {/* Results */}
          <div>
            {justApplied && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-wazifny-green/10 px-4 py-3 text-sm font-medium text-wazifny-green">
                <CheckCircle2 className="h-4 w-4" />
                {t("Application submitted! You can track it from your dashboard.")}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-500">
                  {t("Showing")} {totalCount} {t(totalCount === 1 ? "job" : "jobs")}
                  {aiRanked && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-wazifny-green/10 px-2 py-0.5 text-xs font-medium text-wazifny-green">
                      <Sparkles className="h-3 w-3" /> {t("AI-ranked")}
                    </span>
                  )}
                </p>

                {showPreferencesPrompt && (
                  <div className="mb-6">
                    <PreferencesPrompt
                      onSubmit={handleSavePreferences}
                      onDismiss={() => {
                        setShowPreferencesPrompt(false);
                        setDismissedPrompt(true);
                      }}
                    />
                  </div>
                )}

                {recommended.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-wazifny-green">
                      <Sparkles className="h-4 w-4" /> {t("Recommended for you")}
                    </h2>
                    <div className="space-y-3">
                      {recommended.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          expanded={expandedId === job.id}
                          onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                          applyState={job.has_applied ? "applied" : applyStates[job.id] ?? "idle"}
                          onApply={() => handleApply(job.id)}
                          canApply={!role || role === "talent"}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {jobs.length > 0 && (
                  <div>
                    {recommended.length > 0 && (
                      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                        {t("More opportunities")}
                      </h2>
                    )}
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          expanded={expandedId === job.id}
                          onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                          applyState={job.has_applied ? "applied" : applyStates[job.id] ?? "idle"}
                          onApply={() => handleApply(job.id)}
                          canApply={!role || role === "talent"}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {totalCount === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                    {t("No jobs match your search yet. Try different keywords or clear your filters.")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      }
    >
      <FindJobsContent />
    </Suspense>
  );
}
