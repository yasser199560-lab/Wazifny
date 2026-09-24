"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  Building2,
  Check,
  ExternalLink,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ApiError, applyToJob, getJob, saveJob, translateTexts, type Job } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  remote: "Remote",
  contract: "Contract",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, role, hydrate } = useAuthStore();
  const { language, t } = useLanguage();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyState, setApplyState] = useState<"idle" | "applying" | "applied">("idle");
  const [saved, setSaved] = useState(false);
  const [translatedText, setTranslatedText] = useState<string[] | null>(null);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getJob(params.id, token)
      .then((loadedJob) => {
        setJob(loadedJob);
        setApplyState(loadedJob.has_applied ? "applied" : "idle");
      })
      .catch(() => setError("This job couldn't be found — it may have been closed or removed."))
      .finally(() => setIsLoading(false));
  }, [params.id, token]);

  useEffect(() => {
    if (!job || language !== "ar") {
      setTranslatedText(null);
      return;
    }
    let cancelled = false;
    const texts = [job.title, job.description, ...job.requirements];
    translateTexts(texts, "ar")
      .then((result) => { if (!cancelled) setTranslatedText(result.translations); })
      .catch(() => { if (!cancelled) setTranslatedText(texts); });
    return () => { cancelled = true; };
  }, [job, language]);

  async function handleApply() {
    if (!job) return;
    if (!token || role !== "talent") {
      router.push(`/register?role=talent&next=${job.id}`);
      return;
    }
    setApplyState("applying");
    try {
      await applyToJob(token, job.id);
      setApplyState("applied");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApplyState("applied");
      } else {
        setApplyState("idle");
      }
    }
  }

  async function handleSave() {
    if (!job || !token) return;
    await saveJob(token, job.id);
    setSaved(true);
  }

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !job) {
    return (
      <main>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold text-wazifny-navy">{error}</p>
          <Link href="/jobs" className="text-wazifny-green hover:underline">
            Back to Find Jobs
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const canApply = !role || role === "talent";
  const translatedTitle = translatedText?.[0] ?? job.title;
  const translatedDescription = translatedText?.[1] ?? job.description;
  const translatedRequirements = translatedText?.slice(2) ?? job.requirements;

  return (
    <main>
      <Navbar />

      <section className="relative overflow-hidden bg-wazifny-navy py-14">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-wazifny-navy/70" />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <Link href="/jobs" className="text-sm text-slate-300 hover:text-white">
            ← Back to Find Jobs
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{translatedTitle}</h1>
              <p className="mt-1 text-slate-300">{job.company_name || "Wazifny Partner"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                {JOB_TYPE_LABEL[job.job_type] || job.job_type}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                {job.category}
              </span>
              {job.application_method === "external" && (
                <span className="rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-600">
                  External Application
                </span>
              )}
            </div>

            {job.match_reason && (
              <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-wazifny-green">
                <Sparkles className="h-4 w-4" /> {job.match_reason}
              </p>
            )}

            <h2 className="mt-8 text-lg font-semibold text-wazifny-navy">{t("Job Description")}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
              {translatedDescription}
            </p>

            {job.requirements?.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold text-wazifny-navy">{t("Requirements")}</h2>
                <ul className="mt-2 space-y-2">
                  {translatedRequirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wazifny-green" />
                      {req}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="h-fit space-y-4 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
            {job.salary && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{t("Salary")}</p>
                <p className="text-lg font-bold text-wazifny-green">{job.salary}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("Company")}</p>
              <p className="font-medium text-wazifny-navy">{job.company_name || "Wazifny Partner"}</p>
            </div>

            {job.application_method === "external" ? (
              <a
                href={job.external_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-wazifny-orange px-4 py-3 text-sm font-semibold text-white hover:bg-wazifny-orange-dark"
              >
                Apply on Company Site <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button
                onClick={handleApply}
                disabled={!canApply || applyState !== "idle"}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-wazifny-green px-4 py-3 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applyState === "applying" && <Loader2 className="h-4 w-4 animate-spin" />}
                {applyState === "applied" ? (
                  <>
                    <Check className="h-4 w-4" /> Applied
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" /> {t("Apply Now")}
                  </>
                )}
              </button>
            )}

            {role === "talent" && (
              <button
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-wazifny-navy hover:bg-slate-50"
              >
                <Bookmark className="h-4 w-4" /> {saved ? "Saved ✓" : "Save Job"}
              </button>
            )}
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
