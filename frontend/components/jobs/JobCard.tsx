"use client";

import Link from "next/link";
import { Briefcase, CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { Job } from "@/lib/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  remote: "Remote",
  contract: "Contract",
};

interface JobCardProps {
  job: Job;
  expanded: boolean;
  onToggle: () => void;
  applyState: "idle" | "applying" | "applied";
  onApply: () => void;
  canApply: boolean;
}

/** A compact whole-card link matching the public Find Jobs design. */
export default function JobCard({ job }: JobCardProps) {
  const { language, t } = useLanguage();
  const posted = job.posted_at
    ? new Intl.DateTimeFormat(language === "ar" ? "ar-LB" : "en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(job.posted_at))
    : t("Recently posted");

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-wazifny-green/40 hover:shadow-md sm:flex-row sm:items-stretch"
    >
      <div className="flex h-28 w-full shrink-0 items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 sm:h-auto sm:w-40">
        {job.company_logo_url ? <img src={job.company_logo_url} alt={`${job.company_name || "Company"} logo`} loading="lazy" className="h-20 w-20 rounded-xl bg-white object-contain p-2 shadow-sm" /> : <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-wazifny-navy text-2xl font-bold text-white shadow-sm">{(job.company_name || "W").slice(0, 1).toUpperCase()}</span>}
      </div>
      <div className="min-w-0 flex-1 px-5 py-5">
        <p className="text-xs font-medium text-slate-400">{job.company_name || t("Wazifny Partner")}</p>
        <h2 className="mt-0.5 truncate text-base font-bold text-wazifny-navy transition-colors group-hover:text-wazifny-green">
          {job.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.category}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{posted}</span>
        </div>
        <span className="mt-3 inline-flex rounded-md bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#294b76]">
          {t(JOB_TYPE_LABEL[job.job_type] || job.job_type)}
        </span>
      </div>
      {job.match_reason && <Sparkles className="hidden h-4 w-4 text-wazifny-green sm:block" />}
    </Link>
  );
}
