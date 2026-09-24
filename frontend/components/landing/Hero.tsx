"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Hero() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="relative min-h-[510px] overflow-hidden bg-wazifny-navy sm:min-h-[560px]">
      {/* Background artwork — swap the file at /public/images/hero-bg.jpg (or .svg)
          for a real photo any time; this key just needs to keep matching. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Cpath%20d=%22M0%200h1v60H0zM30%200h1v60h-1zM59%200h1v60h-1z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-wazifny-navy/90 via-wazifny-navy/70 to-wazifny-navy/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-wazifny-navy/55 via-transparent to-wazifny-navy/15" />

      <div className="relative mx-auto flex min-h-[510px] max-w-7xl items-center px-6 py-16 lg:min-h-[560px] lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            {t("Find Your Dream Job")}
            <br />
            <span className="text-wazifny-orange">{t("& Get Results")}</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
            {t("AI-powered job matching platform for Lebanon. Upload your CV, get matched, and apply in seconds.")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/register?role=talent"
              className="inline-flex items-center gap-2 rounded-full bg-wazifny-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wazifny-orange-dark"
            >
              {t("I'm a Talent")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register?role=employer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("I'm an Employer")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-9 flex flex-col gap-2 rounded-md bg-white p-1.5 shadow-xl sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Job title, skills, or company...")}
                className="w-full border-0 bg-transparent text-sm text-wazifny-navy placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </label>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <label className="flex items-center gap-2 px-3 py-2 sm:w-44">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("Beirut...")}
                className="w-full border-0 bg-transparent text-sm text-wazifny-navy placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-wazifny-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark"
            >
              {t("Find Jobs")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
