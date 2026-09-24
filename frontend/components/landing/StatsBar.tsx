"use client";

import { stats as fallbackStats } from "@/lib/landing-data";
import type { LandingStat } from "@/lib/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function StatsBar({ stats }: { stats?: LandingStat[] }) {
  const { t } = useLanguage();
  const data = stats && stats.length > 0 ? stats : fallbackStats;
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-4 lg:px-8">
        {data.map((stat, i) => (
          <div
            key={stat.label}
            className={`text-center ${
              i !== 0 ? "sm:border-l sm:border-slate-100" : ""
            }`}
          >
            <p className="text-3xl font-bold text-wazifny-green sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{t(stat.label)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
