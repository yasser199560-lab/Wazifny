"use client";

import { features } from "@/lib/landing-data";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Features() {
  const { t } = useLanguage();
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-wazifny-green/10 px-3 py-1 text-xs font-semibold text-wazifny-green">
            {t("Platform Features")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-wazifny-navy sm:text-4xl">
            {t("Everything you need to land your next role")}
          </h2>
          <p className="mt-3 text-slate-500">
            {t("Wazifny combines AI technology with a clean platform to make job searching smarter.")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-wazifny-green/10">
                  <Icon className="h-5 w-5 text-wazifny-green" />
                </div>
                <h3 className="mt-4 font-semibold text-wazifny-navy">
                  {t(feature.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {t(feature.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
