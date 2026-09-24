"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories as fallbackCategories } from "@/lib/landing-data";
import type { LandingCategory } from "@/lib/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Categories({
  categories,
}: {
  categories?: LandingCategory[];
}) {
  const { t } = useLanguage();
  const data = categories && categories.length > 0 ? categories : fallbackCategories;
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-wazifny-navy sm:text-4xl">
            {t("Browse by Category")}
          </h2>
          <p className="mt-3 text-slate-500">
            {t("Explore jobs across Lebanon's top industries")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((category) => (
            <Link
              key={category.name}
              href={`/jobs?category=${encodeURIComponent(category.name)}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-5 py-4 text-left shadow-card transition-colors hover:border-wazifny-green/40"
            >
              <span>
                <span className="block font-semibold text-wazifny-navy">
                  {t(category.name)}
                </span>
                <span className="text-sm text-slate-400">
                  {t(category.count)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
