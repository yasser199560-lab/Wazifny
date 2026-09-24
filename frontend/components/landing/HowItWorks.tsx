"use client";

import Link from "next/link";
import { User, Briefcase, ArrowRight } from "lucide-react";
import { talentSteps, employerSteps } from "@/lib/landing-data";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function StepList({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  const { t } = useLanguage();
  return (
    <ol className="mt-6 space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="shrink-0 text-lg font-bold text-slate-200">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-semibold text-wazifny-navy">{t(step.title)}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {t(step.description)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-wazifny-green/10 px-3 py-1 text-xs font-semibold text-wazifny-green">
            {t("How It Works")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-wazifny-navy sm:text-4xl">
            {t("Simple, fast, and intelligent")}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-8 shadow-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wazifny-green text-white">
              <User className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-wazifny-navy">
              {t("For Talents")}
            </h3>
            <StepList steps={talentSteps} />
            <Link
              href="/register?role=talent"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-wazifny-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark"
            >
              {t("Start as Talent")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 p-8 shadow-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wazifny-orange text-white">
              <Briefcase className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-wazifny-navy">
              {t("For Employers")}
            </h3>
            <StepList steps={employerSteps} />
            <Link
              href="/register?role=employer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg border border-wazifny-green px-5 py-2.5 text-sm font-semibold text-wazifny-green transition-colors hover:bg-wazifny-green/10"
            >
              {t("Post a Job")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
