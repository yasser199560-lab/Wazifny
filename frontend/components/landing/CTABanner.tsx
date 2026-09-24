"use client";

import Link from "next/link";
import { UploadCloud, Briefcase, Check } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const trustPoints = ["Free for talents", "No credit card required", "Set up in 3 minutes"];

export default function CTABanner() {
  const { t } = useLanguage();
  return (
    <section className="bg-wazifny-navy py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          {t("Ready to find your perfect match?")}
        </h2>
        <p className="mt-3 text-slate-300">
          {t("Join thousands of talents and employers already using Wazifny.")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register?role=talent"
            className="inline-flex items-center gap-2 rounded-lg bg-wazifny-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wazifny-orange-dark"
          >
            <UploadCloud className="h-4 w-4" />
            {t("Upload CV & Get Matched")}
          </Link>
          <Link
            href="/register?role=employer"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Briefcase className="h-4 w-4" />
            {t("Post a Job Today")}
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-wazifny-green" />
              {t(point)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
